// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuestionTemplateManager {
    enum ParamType { STRING, FLOAT, DATE }

    struct Variable {
        string name;
        ParamType paramType;
        string[] options; // For STRING type only
    }

    struct Template {
        uint256 id;
        string templateText; // E.g., "[TOKEN] will [OPERATOR] $[TARGET_PRICE] before [DEADLINE]"
        Variable[] variables;
        string category;
        bool active;
    }

    struct Question {
        uint256 id;
        uint256 templateId;
        mapping(string => string) answers;
        bool exists;
    }

    uint256 public templateCounter;
    uint256 public questionCounter;

    mapping(uint256 => Template) public templates;
    mapping(uint256 => Question) public questions;

    event TemplateCreated(
        uint256 id,
        string templateText,
        string category
    );
    event VariableAdded(uint256 indexed templateId, string name);
    event QuestionCreated(uint256 indexed id, uint256 indexed templateId);
    event TemplateActivated(uint256 indexed id,bool activated);

    address public owner;
    mapping(address => bool) public allowedOperators;

     modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAllowedOperator() {
        require(allowedOperators[msg.sender], "Not an allowed operator");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addOperator(address operator) external onlyOwner {
        allowedOperators[operator] = true;
    }

    function removeOperator(address operator) external onlyOwner {
        allowedOperators[operator] = false;
    }



    // --- Create Template ---
    function createTemplate(
        string memory _templateText,
        string memory _category
    ) external onlyOwner returns (uint256) {
        templateCounter++;
        templates[templateCounter] = Template({
            id: templateCounter,
            templateText: _templateText,
            category: _category,
            active: false,
            variables: new Variable[](0)
        });
        emit TemplateCreated(templateCounter, _templateText, _category);
        return templateCounter;
    }

    // --- Add Single Variable ---
    function addVariable(
        uint256 templateId,
        string memory name,
        ParamType paramType,
        string[] memory options
    ) public onlyOwner{
        templates[templateId].variables.push(Variable({
            name: name,
            paramType: paramType,
            options: options
        }));
        emit VariableAdded(templateId, name);
    }

    // --- Add Variables in Bulk ---
    function addVariablesBulk(
        uint256 templateId,
        string[] memory names,
        ParamType[] memory paramTypes,
        string[][] memory allOptions
    ) public onlyOwner{
        require(
            names.length == paramTypes.length && names.length == allOptions.length,
            "Length mismatch"
        );
        for (uint256 i = 0; i < names.length; i++) {
            addVariable(templateId, names[i], paramTypes[i], allOptions[i]);
        }
    }

    function resetOptionsForVariable(
        uint256 templateId,
        string memory variableName,
        string[] memory newOptions
    ) public {
        Variable[] storage vars = templates[templateId].variables;

        for (uint256 i = 0; i < vars.length; i++) {
            if (keccak256(bytes(vars[i].name)) == keccak256(bytes(variableName))) {
                require(vars[i].paramType == ParamType.STRING, "Only STRING type can have options");

                // Reset options
                delete vars[i].options;

                for (uint256 j = 0; j < newOptions.length; j++) {
                    vars[i].options.push(newOptions[j]);
                }

                return;
            }
        }

        revert("Variable not found");
    }


    // --- Create Question ---
    // function createQuestion(
    //     uint256 templateId,
    //     string[] memory variableNames,
    //     string[] memory variableValues
    // ) public  onlyAllowedOperator returns (uint256) {
    //     require(variableNames.length == variableValues.length, "Length mismatch");

    //     questionCounter++;
    //     Question storage q = questions[questionCounter];
    //     q.id = questionCounter;
    //     q.templateId = templateId;
    //     q.exists = true;

    //     for (uint256 i = 0; i < variableNames.length; i++) {
    //         q.answers[variableNames[i]] = variableValues[i];
    //     }

    //     emit QuestionCreated(questionCounter, templateId);
    //     return questionCounter;
    // }

    function createQuestion(
    uint256 templateId,
    string[] memory variableNames,
    string[] memory variableValues
) public onlyAllowedOperator returns (uint256) {
    require(variableNames.length == variableValues.length, "Length mismatch");
    require(templates[templateId].active, "Template not active");

    Template storage tmpl = templates[templateId];
    Question storage q = questions[++questionCounter];
    q.id = questionCounter;
    q.templateId = templateId;
    q.exists = true;

        for (uint256 i = 0; i < variableNames.length; i++) {
            string memory varName = variableNames[i];
            string memory varValue = variableValues[i];
            bool found = false;

            for (uint256 j = 0; j < tmpl.variables.length; j++) {
                Variable storage variable = tmpl.variables[j];
                if (keccak256(bytes(variable.name)) == keccak256(bytes(varName))) {
                    found = true;

                    if (variable.paramType == ParamType.STRING && variable.options.length > 0) {
                        bool isValidOption = false;
                        for (uint256 k = 0; k < variable.options.length; k++) {
                            if (keccak256(bytes(varValue)) == keccak256(bytes(variable.options[k]))) {
                                isValidOption = true;
                                break;
                            }
                        }
                        require(isValidOption, string(abi.encodePacked("Invalid value for variable: ", varName)));
                    }

                    // Future type checks (FLOAT, DATE) can go here

                    break;
                }
            }

            require(found, string(abi.encodePacked("Variable name not found in template: ", varName)));
            q.answers[varName] = varValue;
        }

        emit QuestionCreated(questionCounter, templateId);
        return questionCounter;
    }


    // --- Get Variable Details for a Template ---
    function getVariables(uint256 templateId) public view returns (Variable[] memory) {
        return templates[templateId].variables;
    }

    function getVariableByName(uint256 templateId, string memory varName) public view returns (Variable memory) {
        Variable[] memory vars = templates[templateId].variables;
        for (uint i = 0; i < vars.length; i++) {
            if (keccak256(bytes(vars[i].name)) == keccak256(bytes(varName))) {
                return vars[i];
            }
        }
        revert("Variable not found");
    }


    // --- Deactivate Template ---
    function changeTemplateActivation(uint256 templateId,bool activated) external onlyOwner{
        templates[templateId].active = activated;
        emit TemplateActivated(templateId,activated);
    }
}