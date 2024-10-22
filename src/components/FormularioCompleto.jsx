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
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCEP] = useState("");
  const [ibge, setIbge] = useState("");
  const [uf, setUF] = useState("");
  const [localizacao, setLocalizacao] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  // const handleUsarLocalizacao = (event) => {
  //   const checked = event.target.checked;
  //   setLocalizacao(checked);

  //   if (checked) {
  //     if (navigator.geolocation) {
  //       setLoading(true);
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           console.log(position.coords);
  //           const { latitude, longitude } = position.coords;
  //           // consultarAPI(latitude, longitude);
  //           setLoading(false);
  //         },
  //         (error) => {
  //           console.error("Erro ao obter localização:", error);
  //           if (error.code === 1) {
  //             toast.error("Permissão negada pelo usuário.");
  //           } else if (error.code === 2) {
  //             toast.error("Posição indisponível. Tente novamente.");
  //           } else if (error.code === 3) {
  //             toast.error(
  //               "Tempo limite esgotado ao tentar obter a localização."
  //             );
  //           }
  //           setLoading(false);
  //         },
  //         { timeout: 10000 } // Timeout de 10 segundos
  //       );
  //     } else {
  //       console.error("Geolocalização não suportada pelo navegador.");
  //     }
  //   }
  // };

  const handleUsarLocalizacao = (event) => {
    const checked = event.target.checked;
    setLocalizacao(checked);

    if (checked) {
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            console.log(position.coords.accuracy);
            if (position.coords.accuracy > 1000) {
              toast.warning(
                "A precisão da localização é baixa. Tente novamente em um local com melhor sinal."
              );
            } else {
              toast.success(
                `Localização obtida: Latitude ${latitude}, Longitude ${longitude}`
              );

              consultarNominatim(latitude, longitude);
            }

            setLoading(false);
          },
          (error) => {
            console.error("Erro ao obter localização:", error);
            if (error.code === 1) {
              toast.error("Permissão negada pelo usuário.");
            } else if (error.code === 2) {
              toast.error("Posição indisponível. Tente novamente.");
            } else if (error.code === 3) {
              toast.error(
                "Tempo limite esgotado ao tentar obter a localização."
              );
            }
            setLoading(false);
          },
          { timeout: 10000 }
        );
      } else {
        console.error("Geolocalização não suportada pelo navegador.");
      }
    } else {
      setEndereco("");
      setBairro("");
      setCidade("");
      setUF("");
      setNumero("");
      setCEP("");
      setComplemento("");
      setIbge("");
    }
  };

  // Função para consultar a API Nominatim
  const consultarNominatim = (latitude, longitude) => {
    setEndereco("...");
    setBairro("...");
    setCidade("...");
    setNumero("...");
    setUF("...");
    setComplemento("...");

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("Resultado da Nominatim:", data);
        const endereco = data.display_name;
        const estadoISO = data.address["ISO3166-2-lvl4"]; // Capturando o 'MG'

        toast.success(`Endereço encontrado: ${endereco}`);

        setEndereco(data.address.road || "");
        setCidade(data.address.town || "");
        setBairro(data.address.suburb || "");
        setEndereco(data.address.road || "");
        setComplemento(data.address.state_district || "");
        setUF(estadoISO.split("-")[1] || "");
        setCEP(data.address.postcode || "");
        setNumero("");
      })
      .catch((error) => {
        console.error("Erro ao consultar a Nominatim:", error);
        toast.error("Erro ao obter o endereço.");
      });
  };

  // Função para consultar o CEP
  const consultarCEP = () => {
    setLoading(true);
    if (!cep) {
      toast.error("Informe um cep");
      setLoading(false);
      return;
    }
    setEndereco("...");
    setBairro("...");
    setCidade("...");
    setNumero("...");
    setUF("...");
    setComplemento("...");

    // axios
    // .get(`https://brasilapi.com.br/api/cep/v2/${cep}`)
    // .then((response) => {
    //   console.log(response);
    //   if (response.data.erro) {
    //     toast.error("Erro ao consultar CEP");
    //     resetFields();
    //   } else {
    //     setEndereco(response.data.street || "");
    //     setBairro(response.data.neighborhood || "");
    //     setCidade(response.data.city || "");
    //     setUF(response.data.state || "");
    //     setNumero(""); // Resetar o número
    //     setComplemento(""); // Resetar o complemento
    //   }
    // })
    axios
      .get("https://opencep.com/v1/" + cleanData(cep))
      .then((response) => {
        console.log(response);
        if (response.data.erro) {
          toast.error("Erro ao consultar CEP");
          resetFields();
        } else {
          setEndereco(response.data.logradouro || "");
          setBairro(response.data.bairro || "");
          setCidade(response.data.localidade || "");
          setUF(response.data.uf || "");
          setNumero("");
          setComplemento(response.data.complemento || "");
          setIbge(response.data.ibge || "");
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar CEP:", error);
        toast.error(
          error.response.data.message || "Erro ao consultar CEP informado"
        );
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
    setComplemento("");
    setIbge("");

    setLocalizacao(false);

    const checkbox = document.getElementById("usarLocalizacao");
    if (checkbox) {
      checkbox.checked = false;
    }
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
      complemento,
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
      telefone_2: formulario.telefone || "",
      email: formulario.email || "",
      indicacao: "",
      plano: "",
      cpfcnpj: formulario.documento || "",
      logradouro: formulario.endereco || "",
      numero: formulario.numero || "",
      complemento: formulario.complemento || "",
      bairro: formulario.bairro || "",
      cidade: formulario.cidade || "",
      uf: formulario.uf || "",
      // ibge: formulario.ibge || "",
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
      <div className="flex items-center mb-1">
        <input
          id="usarLocalizacao"
          type="checkbox"
          checked={localizacao}
          className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-2"
          onChange={handleUsarLocalizacao}
        />
        <label
          htmlFor="usarLocalizacao"
          className="ml-2 text-sm font-medium text-gray-900"
        >
          Usar minha localização
        </label>
      </div>

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
          value={endereco}
          onChange={(event) => setEndereco(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Bairro"
          value={bairro}
          onChange={(event) => setBairro(event.target.value)}
          className="border border-slate-300 outline-slate-400 px-4 py-2 rounded-md"
        />
        <Input
          type="text"
          placeholder="Complemento"
          value={complemento}
          onChange={(event) => setComplemento(event.target.value)}
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
          value={uf}
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
