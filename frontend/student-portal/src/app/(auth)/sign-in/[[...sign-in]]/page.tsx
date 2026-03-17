import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn 
      appearance={{
        elements: {
          formButtonPrimary: 
            "bg-blue-600 hover:bg-blue-700 text-sm normal-case rounded-xl h-11",
          card: "shadow-none border-none p-0",
          headerTitle: "text-2xl font-black text-slate-900",
          headerSubtitle: "text-slate-500 font-medium",
          socialButtonsBlockButton: "rounded-xl border-slate-200 hover:bg-slate-50",
          formFieldInput: "rounded-xl border-slate-200 focus:ring-blue-500/10 focus:border-blue-500",
          footerActionLink: "text-blue-600 hover:text-blue-700 font-bold",
        }
      }}
    />
  );
}
