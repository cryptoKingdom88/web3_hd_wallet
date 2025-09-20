import LoginDialog from "./components/LoginDialog";
import MessageSigner from "./components/MyWallet";
import "./App.css";


function App() {

  return (
    <div className="bg-primary-foreground container grid h-svh max-w-none items-center justify-center">
      {!isLoggedIn ? (
        <LoginDialog />
      ) : (
        <MessageSigner />
      )}
    </div>
  );
}

export default App;
