
import React from "react";
import WalletInfo from "./signer/WalletInfo";
import MessageSignForm from "./signer/MessageSignForm";

const MessageSigner: React.FC = () => {
  return (
    <div className="message-signer sm:w-[720px]">
      <WalletInfo />
      <MessageSignForm />
    </div>
  );
};

export default MessageSigner;
