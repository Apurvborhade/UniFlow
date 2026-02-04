import Navbar from "@/components/Navbar";


const layout = async ({ children }: { children: React.ReactNode }) => {

  return (
    <main className=" min-h-screen ">
      <Navbar/>
      <div className="container py-10">{children}</div>
    </main>
  );
};

export default layout;