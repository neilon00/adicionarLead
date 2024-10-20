import { useState, useEffect } from "react";
import Input from "./Input";
import InputMascara from "./InputMascara";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import validator from "validator";

const cleanData = (input) => {
  return input.replace(/\D/g, ""); // Remove tudo que não é número
};

function FormularioCompleto() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CPF");

  // Estados para o endereço
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCEP] = useState("");
  const [uf, setUF] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  // Função para alternar entre CPF e CNPJ
  const toggleTipoDocumento = () => {
    setTipoDocumento((prev) => (prev === "CPF" ? "CNPJ" : "CPF"));
  };

  // Função para consultar o CEP
  const consultarCEP = () => {
    setLoading(true);
    setEndereco("...");
    setBairro("...");
    setCidade("...");
    setNumero("...");
    setUF("...");

    axios
      .get(`/api/ws/${cep}/json/`)
      .then((response) => {
        if (response.data.erro) {
          toast.error("Erro ao consultar CEP");
          resetFields();
        } else {
          setEndereco(response.data.logradouro || "");
          setBairro(response.data.bairro || "");
          setCidade(response.data.localidade || "");
          setUF(response.data.uf || "");
          setNumero(""); // Resetar o número
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar CEP:", error);
        toast.error(error.message);
        resetFields();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetFields = () => {
    setEndereco("");
    setBairro("");
    setCidade("");
    setUF("");
    setNumero("");
    setCEP("");
    setNome("");
    setSobrenome("");
    setTelefone("");
    setEmail("");
    setDocumento("");
  };

  const handleSubmit = () => {
    setLoadingEnvio(true);

    if (!telefone || !documento || !nome || !cep) {
      toast.error("É preciso preencher todos os campos");
      setLoadingEnvio(false);
      return;
    }

    const formulario = {
      nome,
      sobrenome,
      telefone: telefone,
      documento: documento,
      email,
      endereco,
      numero,
      bairro,
      cidade,
      uf,
      cep,
    };

    console.log("Formulário enviado:", formulario);

    // Cabeçalhos para a requisição
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer MTYwMDE1MTQ5NjVmMTA1MTk2NGJlMDI=",
        Accept: "*/*",
      },
    };

    // Dados a serem enviados no corpo da requisição
    const data = {
      empresa: "1",
      status: "A",
      campanha: "1",
      usuario: 1,
      nome: formulario.nome || "",
      cep: formulario.cep || "",
      telefone: formulario.telefone || "",
      telefone_2: "",
      email: formulario.email || "",
      indicacao: "",
      plano: "",
      cpfcnpj: formulario.documento || "",
      logradouro: formulario.endereco || "",
      numero: formulario.numero || "",
      complemento: "",
      bairro: formulario.bairro || "",
      cidade: formulario.cidade || "",
      uf: formulario.uf || "",
    };

    // Submissão do formulário usando Axios
    axios
      .post("https://api.ispcloud.com.br/AdicionarLead", data, config)
      .then((response) => {
        console.log(response.data);
        setLoadingEnvio(false);
        if (response.data.sucesso) {
          toast.success("Lead cadastrado com sucesso!");
        }
        resetFields();
      })
      .catch((error) => {
        setLoadingEnvio(false);
        console.log("Erro:", error);
        // Verifica se a resposta contém a mensagem de erro
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.erro; // Captura a mensagem de erro
          toast.error(errorMessage); // Exibe a mensagem de erro
        } else {
          toast.error("Ocorreu um erro inesperado."); // Mensagem padrão para outros erros
        }
      })
      .finally(() => {
        setLoadingEnvio(false);
      });
  };

  return (
    <div className="space-y-4 p-6 bg-slate-200 rounded-md shadow flex flex-col">
      <Input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
      />
      <Input
        type="text"
        placeholder="Sobrenome"
        value={sobrenome}
        onChange={(event) => setSobrenome(event.target.value)}
        className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
      />

      <div className="space-x-3">
        <button
          onClick={toggleTipoDocumento}
          className="mb-2 p-2 px-6 w-[83px] bg-slate-400 hover:bg-slate-500 text-white rounded-md font-medium"
        >
          {tipoDocumento === "CPF" ? "CPF" : "CNPJ"}
        </button>

        <InputMascara
          type="text"
          placeholder="Documento"
          value={documento}
          onChange={(event) => setDocumento(event.target.value)}
          className="border border-slate-300 outline-slate-400 py-2 rounded-md px-4 required w-[220px]"
          mask={
            tipoDocumento === "CPF" ? "999.999.999-99" : "99.999.999/9999-99"
          }
        />
        <InputMascara
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md required w-[220px] mb-10"
          mask="(99) 99999-9999"
        />

        <InputMascara
          type="text"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md required w-[290px] mb-10"
        />
      </div>

      {/* Inputs de endereço */}
      <div className="space-y-4 bg-slate-200 rounded-md flex flex-col mt-15">
        <div className="space-x-3">
          <InputMascara
            type="text"
            placeholder="CEP"
            value={cep}
            onChange={(event) => setCEP(event.target.value)}
            className="border border-slate-300 outline-slate-400 py-2 rounded-md px-4 required w-96"
            mask="99999-999"
          />

          <button
            onClick={consultarCEP}
            disabled={loading}
            type="button"
            className={`text-white ${
              loading ? "bg-slate-400" : "bg-slate-400 hover:bg-slate-500"
            } focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 inline-flex items-center`}
          >
            {loading && <LoadingSpinner />}
            {!loading ? "Consultar" : "Aguarde ..."}
          </button>
        </div>

        <Input
          type="text"
          placeholder="Endereço"
          value={endereco}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
          onChange={(event) => setEndereco(event.target.value)}
        />
        <div className="space-x-4">
          <Input
            type="text"
            placeholder="Cidade"
            value={cidade}
            className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md w-[450px]"
            onChange={(event) => setCidade(event.target.value)}
          />

          <Input
            type="text"
            placeholder="Bairro"
            value={bairro}
            className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md w-[180px]"
            onChange={(event) => setBairro(event.target.value)}
          />
          <Input
            type="text"
            placeholder="Número"
            value={numero}
            className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md w-[100px]"
            onChange={(event) => setNumero(event.target.value)}
          />
          <Input
            type="text"
            placeholder="UF"
            value={uf}
            className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md w-[70px]"
            onChange={(event) => setUF(event.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loadingEnvio}
        className={`text-white px-4 py-2 rounded-md font-medium w-full flex justify-center items-center ${
          loadingEnvio ? "bg-slate-400" : "bg-slate-400 hover:bg-slate-500"
        } focus:ring-4 focus:ring-gray-200`}
      >
        {loadingEnvio && <LoadingSpinner />}
        {!loadingEnvio ? "Enviar" : "Aguarde ..."}
      </button>
      <ToastContainer />
    </div>
  );
}

const LoadingSpinner = () => (
  <svg
    aria-hidden="true"
    role="status"
    className="inline w-4 h-4 me-3 text-white animate-spin"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="#E5E7EB"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentColor"
    />
  </svg>
);

export default FormularioCompleto;
