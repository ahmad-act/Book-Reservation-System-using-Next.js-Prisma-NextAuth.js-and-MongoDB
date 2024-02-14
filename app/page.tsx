import { redirect } from "next/navigation";
import Link from "next/link";
import Header from '@/app/components/header';
import Image from "next/image";


export default async function Home() {

  return (
    <main className="p-4 bg-purple-300 min-w-full min-h-screen">
      <Header />
      <nav className="px-12 py-5 flex justify-center items-center">
        <Image src="/images/logo.png" width={500} height={0} alt="Logo" />
      </nav>
    </main>
  );

}
