import UI_IMG from "/main-bg.jpg";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[55vw] px-12 pt-8 pb-12">
        <div className="flex flex-col">
          <img src="/logo-002.png" alt="plan-ahead-logo" className="w-[25px]" />
          <h2 className="text-lg font-medium text-primary">
            Plan<span className="text-secondary">A</span>head_
          </h2>
        </div>
        {children}
      </div>

      <div className="hidden md:flex w-[45vw] h-screen items-center justify-center">
        <img
          src={UI_IMG}
          className="w-[100%] h-[100%] bg-cover bg-no-repeat bg-center overflow-hidden object-cover"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
