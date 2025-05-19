import { Suspense } from 'react';
import ChallengePage from './challengepage';

export default function Page({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChallengePage predictionId={params.predictionId} />
    </Suspense>
  );
}
