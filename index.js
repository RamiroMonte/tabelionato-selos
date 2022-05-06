var fs = require("fs");
var xml2js = require("xml2js");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getInfos = (
  data,
  dataStart,
  dataEnd,
  seloCod = null,
  dateArray = null
) => {
  let valorTotalSim = 0;
  let valorTotalNao = 0;
  let totalSelosSim = 0;
  let totalSelosNao = 0;
  let seloCodigo = "Não informado";
  let seloValorSim = 0;
  let seloValorNao = 0;
  data.forEach((nota) => {
    // console.log(nota);
    const cobrar_selo = Object.values(nota)[0].cobrar_selo;
    const date = Object.values(nota)[0].dt_emissao;
    const valor = Object.values(nota.atoc[0])[0].valor;
    const seloId = Object.values(nota.atoc[0])[0].selo;
    const numTalao = Object.values(nota)[0].num_talao;

    // if (numTalao === "2") {
    // console.log(seloCod);
    // console.log(seloId);
    if (seloCod && seloCod === seloId) {
      console.log("Selo encontrado");
      seloCodigo = seloId;
      if (cobrar_selo === "S") {
        seloValorSim += parseFloat(valor.replace(".", "").replace(",", "."));
      } else if (cobrar_selo === "N") {
        seloValorNao += parseFloat(valor.replace(".", "").replace(",", "."));
      } else {
        seloValorNao = 9999;
      }
    }

    var dateArrayTimeStamp = dateArray.map((date) => {
      return new Date(date).getTime();
    });

    // convert date to timestamp and check if it is between two dates
    let data_emissao = date.split("/");

    const timestamp = new Date(
      `${data_emissao[2]}-${data_emissao[1]}-${data_emissao[0]}`
    ).getTime();

    if (dateArrayTimeStamp.includes(timestamp)) {
      const startDate = new Date(dataStart).getTime();
      const endDate = new Date(dataEnd).getTime();

      // if (timestamp >= startDate && timestamp <= endDate) {
      // console.log("Data OK: ", date);
      if (cobrar_selo == "S") {
        totalSelosSim++;
        valorTotalSim += parseFloat(valor.replace(".", "").replace(",", "."));
      } else if (cobrar_selo == "N") {
        totalSelosNao++;
        valorTotalNao += parseFloat(valor.replace(".", "").replace(",", "."));
      }
      // } else {
      // console.log("Data fora do periodo: ", date);
      // }
    }

    // }
  });

  return {
    totalSelosSim: totalSelosSim,
    totalSelosNao: totalSelosNao,
    totalSelos: totalSelosSim + totalSelosNao,
    valorTotalSim: valorTotalSim,
    valorTotalNao: valorTotalNao,
    seloCodigo: seloCodigo,
    seloValorSim: seloValorSim,
    seloValorNao: seloValorNao,
  };
};

const formatToBrl = (valor) => {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const files = fs.readdirSync("./selos/");

let infos = {
  totalSelosSim: 0,
  totalSelosNao: 0,
  totalSelos: 0,
  valorTotalSim: 0,
  valorTotalNao: 0,
  seloCodigo: "",
  seloValorSim: 0,
  seloValorNao: 0,
};
var parser = new xml2js.Parser();
var dataStart = "2022-03-02";
var dataEnd = "2022-04-04";
var dateArray = [
  "2022-03-07",
  "2022-03-21",
  "2022-03-04",
  "2022-03-02",
  "2022-02-25",
  "2022-02-24",
  "2022-02-23",
  "2022-02-22",
  "2022-02-21",
  "2022-02-18",
  "2022-03-18",
  "2022-02-17",
  "2022-02-16",
  "2022-02-15",
  "2022-02-14",
  "2022-02-11",
  "2022-02-10",
  "2022-02-09",
  "2022-02-08",
  "2022-02-07",
  "2022-02-04",
  "2022-02-03",
  "2022-02-01",
];
// var seloID = "00210000155667";
var seloID = null;
files.forEach((file) => {
  console.log("Processando arquivo: " + file);
  const content = fs.readFileSync(`./selos/${file}`, "utf-8");
  parser.parseString(content, function (err, result) {
    const data = result.arquivo_selos.notas[0].nota;
    const res = getInfos(data, dataStart, dataEnd, seloID, dateArray);
    infos.totalSelosSim += res.totalSelosSim;
    infos.totalSelosNao += res.totalSelosNao;
    infos.totalSelos += res.totalSelos;
    infos.valorTotalSim += res.valorTotalSim;
    infos.valorTotalNao += res.valorTotalNao;
    if (res.seloCodigo !== "Não informado") {
      infos.seloCodigo = res.seloCodigo;
      infos.seloValorSim += res.seloValorSim;
      infos.seloValorNao += res.seloValorNao;
    }
  });
});
console.log();
console.log(`------Resultado - ${dataStart} até ${dataEnd}------`);
console.log("Quantidade Total de Selos: " + infos.totalSelos);
console.log("Total de Selos Sim: " + infos.totalSelosSim);
console.log("Total de Selos Não: " + infos.totalSelosNao);
console.log("Valor Total de Selos Sim: " + formatToBrl(infos.valorTotalSim));
console.log("Valor Total de Selos Não: " + formatToBrl(infos.valorTotalNao));
if (seloID !== null) {
  console.log("Selo " + infos.seloCodigo + ": " + infos.seloCodigo);
  console.log("Valor Sim: " + formatToBrl(infos.seloValorSim));
  console.log("Valor Não: " + formatToBrl(infos.seloValorNao));
}
