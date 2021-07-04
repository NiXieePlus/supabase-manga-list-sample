import type { ReactNode } from "react";
import { Footer } from "src/components/footer";
import { Header } from "src/components/header";

type Props = {
  children: ReactNode;
};

export const LayoutWrapper = (props: Props) => {
  return (
    <div className="bg-gray-300">
      <div className="container mx-auto grid grid-rows-[auto,1fr,auto] min-h-screen">
        <Header />
        <main className="px-4 text-gray-600 bg-gray-100">
          <div>{props.children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};
