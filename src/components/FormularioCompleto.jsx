import { useState } from "react";
import Input from "./Input";
import InputMascara from "./InputMascara";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import validator from "validator";
import { ClipLoader } from "react-spinners";

const LoadingSpinner = () => {
  return <ClipLoader color="#ffffff" size={20} />;
};

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

  // Função para consultar o CEP
  const consultarCEP = () => {
    setLoading(true);
    setEndereco("...");
    setBairro("...");
    setCidade("...");
    setNumero("...");
    setUF("...");

    axios
      .get(`https://viacep.com.br/api/ws/${cep}/json/`)
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

    if (!validator.isEmail(email)) {
      toast.error("Email inválido");
      setLoadingEnvio(false);
      return;
    }

    if (telefone.length < 11) {
      toast.error("Telefone inválido");
      setLoadingEnvio(false);
      return;
    }

    if (tipoDocumento === "CPF" && cleanData(documento).length !== 11) {
      toast.error("CPF inválido");
      setLoadingEnvio(false);
      return;
    } else if (tipoDocumento === "CNPJ" && cleanData(documento).length !== 14) {
      toast.error("CNPJ inválido");
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

      <div className="flex space-x-3 mb-4">
        <button
          onClick={() =>
            setTipoDocumento(tipoDocumento === "CPF" ? "CNPJ" : "CPF")
          }
          className="p-2 px-6 bg-slate-400 hover:bg-slate-500 text-white rounded-md font-medium"
        >
          {tipoDocumento === "CPF" ? "CPF" : "CNPJ"}
        </button>

        <InputMascara
          type="text"
          placeholder="Documento"
          value={documento}
          onChange={(event) => setDocumento(event.target.value)}
          className="border border-slate-300 outline-slate-400 py-2 rounded-md px-4 w-full"
          mask={
            tipoDocumento === "CPF" ? "999.999.999-99" : "99.999.999/9999-99"
          }
        />
      </div>

      <div className="flex space-x-3 mb-4">
        <InputMascara
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md w-full"
          mask="(99) 99999-9999"
        />

        <InputMascara
          type="text"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md w-full"
        />
      </div>

      {/* Alinhamento do botão com o campo CEP */}
      <div className="flex space-x-3 mb-4">
        <InputMascara
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(event) => setCEP(event.target.value)}
          className="border border-slate-300 outline-slate-400 py-2 rounded-md px-4 required w-full"
          mask="99999-999"
        />

        <button
          onClick={consultarCEP}
          disabled={loading}
          type="button"
          className={`text-white ${
            loading ? "bg-slate-400" : "bg-slate-400 hover:bg-slate-500"
          } focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center min-w-[150px]`} // Ajuste o valor de min-w conforme necessário
        >
          {loading && <LoadingSpinner />}
          {!loading ? "Consultar" : ""}
        </button>
      </div>

      {/* Endereço e Cidade (70% / 30% para responsividade) */}
      <div className="grid grid-cols-1 mb-4">
        <Input
          type="text"
          placeholder="Endereço"
          value={uf}
          onChange={(event) => setEndereco(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Bairro"
          value={bairro}
          onChange={(event) => setBairro(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />

        <Input
          type="text"
          placeholder="Número"
          value={numero}
          onChange={(event) => setNumero(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Cidade"
          value={cidade}
          onChange={(event) => setCidade(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />
        <Input
          type="text"
          placeholder="Estado"
          value={endereco}
          onChange={(event) => setUF(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loadingEnvio}
        type="button"
        className={`bg-slate-400 hover:bg-slate-500 text-white font-medium rounded-lg text-sm px-5 py-2.5 relative flex items-center justify-center`}
      >
        {loadingEnvio && (
          <LoadingSpinner className="absolute left-1/2 transform -translate-x-1/2" />
        )}
        {!loadingEnvio ? "Enviar" : ""}
      </button>

      <ToastContainer />
    </div>
  );
}

export default FormularioCompleto;
