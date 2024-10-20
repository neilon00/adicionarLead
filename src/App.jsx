import { useEffect, useState } from "react";
import { v4 } from "uuid";
import Title from "./components/Title";
import FormularioCompleto from "./components/FormularioCompleto";

function App() {
  return (
    <div className="w-screen h-screen bg-slate-700 flex justify-center p-6">
      <div className="w-[900px] space-y-6">
        <Title>Preencha seus dados abaixo</Title>
        <FormularioCompleto />
      </div>
    </div>
  );
}
export default App;
