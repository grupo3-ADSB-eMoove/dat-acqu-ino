// não altere!
const serialport = require("serialport");
const express = require("express");
const mysql = require("mysql2");
const sql = require("mssql");

// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// configure a linha abaixo caso queira que os dados capturados sejam inseridos no banco de dados.
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = true;
// altere o valor da variável AMBIENTE para o valor desejado:
// API conectada ao banco de dados remoto, SQL Server -> 'producao'
// API conectada ao banco de dados local, MySQL Workbench - 'desenvolvimento'
const AMBIENTE = "desenvolvimento";

const serial = async (
  valoresEntrada1,
  valoresEntrada2,
  valoresEntrada3,
  valoresCorredor1,
  valoresCorredor2
) => {
  let poolBancoDados = "";

  if (AMBIENTE == "desenvolvimento") {
    poolBancoDados = mysql
      .createPool({
        // altere!
        // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
        host: "10.18.32.90",
        user: "servidor",
        password: "123",
        database: "emoove",
      })
      .promise();
  } else if (AMBIENTE == "producao") {
    console.log(
      "Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo."
    );
  } else {
    throw new Error(
      'Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.'
    );
  }

  const portas = await serialport.SerialPort.list();
  const portaArduino = portas.find(
    (porta) => porta.vendorId == 2341 && porta.productId == 43
  );
  if (!portaArduino) {
    throw new Error("O arduino não foi encontrado em nenhuma porta serial");
  }
  const arduino = new serialport.SerialPort({
    path: portaArduino.path,
    baudRate: SERIAL_BAUD_RATE,
  });
  arduino.on("open", () => {
    console.log(
      `A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`
    );
  });
  arduino
    .pipe(new serialport.ReadlineParser({ delimiter: "\r\n" }))
    .on("data", async (data) => {
      // console.log(data);
      const valores = data.split(";");
      const entrada1 = parseInt(valores[0]);
      const entrada2 = parseInt(valores[1]);
      const entrada3 = parseInt(valores[2]);
      const corredor1 = parseInt(valores[3]);
      const corredor2 = parseInt(valores[4]);

      var hora = new Date();
      hora = hora.toLocaleString("pt-BR");

      valoresEntrada1.push([entrada1, hora]);
      valoresEntrada2.push([entrada2, hora]);
      valoresEntrada3.push([entrada3, hora]);
      valoresCorredor1.push([corredor1, hora]);
      valoresCorredor2.push([corredor2, hora]);

      console.log(
        "Entrada Norte " + valoresEntrada1[valoresEntrada1.length - 1]
      );
      console.log("Entrada Sul " + valoresEntrada2[valoresEntrada2.length - 1]);
      console.log(
        "Corredor Bebidas " + valoresCorredor1[valoresCorredor1.length - 1]
      );
      console.log(
        "Corredor Doces " + valoresCorredor2[valoresCorredor2.length - 1]
      );

      if (HABILITAR_OPERACAO_INSERIR) {
        if (AMBIENTE == "producao") {
          // altere!
          // Este insert irá inserir os dados na tabela "medida"
          // -> altere nome da tabela e colunas se necessário
          // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
          // >> Importante! você deve ter o aquario de id 1 cadastrado.
          sqlquery = `INSERT INTO medida (dht11_umidade, dht11_temperatura, luminosidade, lm35_temperatura, chave, momento, fk_aquario) VALUES (${dht11Umidade}, ${dht11Temperatura}, ${luminosidade}, ${lm35Temperatura}, ${chave}, CURRENT_TIMESTAMP, 1)`;

          // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
          // Importante! você deve ter criado o usuário abaixo com os comandos presentes no arquivo
          // "script-criacao-usuario-sqlserver.sql", presente neste diretório.
          const connStr =
            "Server=servidor-acquatec.database.windows.net;Database=bd-acquatec;User Id=usuarioParaAPIArduino_datawriter;Password=#Gf_senhaParaAPI;";

          function inserirComando(conn, sqlquery) {
            conn.query(sqlquery);
            console.log(
              "valores inseridos no banco: ",
              entrada1
            );
          }

          sql
            .connect(connStr)
            .then((conn) => inserirComando(conn, sqlquery))
            .catch((err) => console.log("erro! " + err));
        } else if (AMBIENTE == "desenvolvimento") {
          // altere!
          // Este insert irá inserir os dados na tabela "medida"
          // -> altere nome da tabela e colunas se necessário
          // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
          // >> você deve ter o aquario de id 1 cadastrado.
          await poolBancoDados.execute(
            "INSERT INTO capturadados (dtHora, fkSensor, valor) VALUES (now(), 1, ?);",
            [
              entrada1
            ]
          );
          await poolBancoDados.execute(
            "INSERT INTO capturadados (dtHora, fkSensor, valor) VALUES (now(), 2, ?);",
            [
              entrada2
            ]
          );
          console.log(
            "valores inseridos no banco: ",
            entrada1
          );
        } else {
          throw new Error(
            'Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.'
          );
        }
      }
    });
  arduino.on("error", (mensagem) => {
    console.error(`Erro no arduino (Mensagem: ${mensagem}`);
  });
};

// não altere!
const servidor = (
  valoresDht11Umidade,
  valoresDht11Temperatura,
  valoresLuminosidade,
  valoresLm35Temperatura,
  valoresChave
) => {
  const app = express();
  app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.listen(SERVIDOR_PORTA, () => {
    console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
  });
  app.get("/sensores/dht11/umidade", (_, response) => {
    return response.json(valoresDht11Umidade);
  });
  app.get("/sensores/dht11/temperatura", (_, response) => {
    return response.json(valoresDht11Temperatura);
  });
  app.get("/sensores/luminosidade", (_, response) => {
    return response.json(valoresLuminosidade);
  });
  app.get("/sensores/lm35/temperatura", (_, response) => {
    return response.json(valoresLm35Temperatura);
  });
  app.get("/sensores/chave", (_, response) => {
    return response.json(valoresChave);
  });
};

(async () => {
  const valoresEntrada1 = [];
  const valoresEntrada2 = [];
  const valoresEntrada3 = [];
  const valoresCorredor1 = [];
  const valoresCorredor2 = [];
  await serial(
    valoresEntrada1,
    valoresEntrada2,
    valoresEntrada3,
    valoresCorredor1,
    valoresCorredor2
  );
  servidor(
    valoresEntrada1,
    valoresEntrada2,
    valoresEntrada3,
    valoresCorredor1,
    valoresCorredor2
  );
})();
