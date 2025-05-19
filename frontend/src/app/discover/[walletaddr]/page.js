import { Suspense } from 'react';
import ListPage from './listpage';

export default function Page({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListPage walletaddr={params.walletaddr} />
    </Suspense>
  );
}
