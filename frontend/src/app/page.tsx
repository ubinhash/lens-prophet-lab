import { Login } from "@/components/login";
import { Logout } from "@/components/logout";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PredictionCard from "./prediction-card";
import Link from "next/link";
import styles from './page.module.css';
import { TopProphetCard } from "./prophet-card";
/**
 * Fetches authenticated user account if logged in
 */
async function getAuthenticatedAccount() {
  const client = await getLensClient();

  if (!client.isSessionClient()) {
    return null;
  }

  const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
  if (!authenticatedUser) {
    return null;
  }

  return fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
}


// export async function logoutFromLens() {
//   const client = await getLensClient();

//   if (client.isSessionClient()) {
//     await client.logout();
//   }
// }

export default async function Home() {
  const account = await getAuthenticatedAccount();



  return (
    <div className={`flex flex-col lg:flex-row justify-between p-8 ${styles.minHeightCenter}`}>
    {/* Left Side: Main Text Content */}
    <div className="max-w-xl flex flex-col h-120">
        <h1 className="text-6xl font-bold">
            <span className="border-b-4 border-blue-400 mb-1 inline-block">LENS</span><br />
            <span className="border-b-4 border-blue-400">PROPHET LAB</span>
        </h1>
        <h2 className="text-2xl font-light mt-4">WHERE WORD CARRIES WEIGHT</h2>
        <ul className="mt-6 text-lg space-y-2">
            <li>Predict with reasoning</li>
            <li>Pick your odds based on confidence</li>
            <li>Rise as a Prophet and build your reputation</li>
        </ul>
        <div className="w-40 mt-2">
            {!account && <Login />}
            {account &&    
           <div className="flex gap-x-4 mt-0">
            <Link href="/create">
                <button className="mt-3 px-6 py-3 bg-black text-white rounded" style={{ cursor:"pointer" }}>
                        Predict
                </button>
            </Link>
            <Link href="/discover">
                <button className="mt-3 px-6 py-3 bg-black text-white rounded" style={{ backgroundColor: 'rgb(137, 179, 82)',cursor:"pointer" }}>
                    Discover
                </button>
              </Link>
             </div>
         }
        </div>

        {/* Make this act like a sticky footer in the left column */}
        <p className="mt-auto pt-10 text-gray-600 text-lg">
            A Novel Creator Centric Prediction & Social Market
        </p>
</div>
  
    {/* Right Side: Placeholder Cards */}
    <div className="flex flex-col space-y-6 mt-12 lg:mt-0 lg:ml-8 ">
      <div className="w-80 h-60 bg-green-100 rounded shadow-md"><TopProphetCard></TopProphetCard></div>
      <div className="w-80 h-60 bg-rose-100 rounded shadow-md"><PredictionCard></PredictionCard></div>
    </div>
  </div>
  
  );
}

