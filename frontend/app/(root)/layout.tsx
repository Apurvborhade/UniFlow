import Navbar from "@/components/Navbar";


const layout = async ({ children }: { children: React.ReactNode }) => {

  return (
    <main className=" min-h-screen flex flex-col justify-center items-center">
      <Navbar/>
      <div className="container py-10 mt-20">{children}</div>
    </main>
  );
};

export default layout;