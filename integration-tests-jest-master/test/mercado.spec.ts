import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker/.';

describe('Mercado', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com';
  let mercado = null;
  let fruta = null;
  let doce = null;
  let salgado = null;
  let farinha = null;

  p.request.setDefaultTimeout(90000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  it('Deve cadastrar um novo mercado', async () => {
    mercado = await p
        .spec()
        .post(`${baseUrl}/mercado`)
        .expectStatus(StatusCodes.CREATED)
        .withBody({
            cnpj: (Math.random() * 100000000000000).toFixed(0),
            endereco: faker.location.street(),
            nome: faker.person.fullName()
        })
        .returns('novoMercado.id');
    console.log(mercado);
});

    it('Deve cadastrar uma nova fruta no mercado', async () => {
      fruta = await p
        .spec()
        .post(`${baseUrl}/mercado/${mercado}/produtos/hortifruit/frutas`)
        .withHeaders('monitor', false)
        .withJson({
          nome: faker.commerce.productName(),
          valor: parseFloat(faker.commerce.price()),  
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('Produto adicionado com sucesso')
        .returns('_id');
    });

    it('Erro ao tentar cadastrar fruta sem nome', async () => {
      await p
        .spec()
        .post(`${baseUrl}/mercado/${mercado}/produtos/hortifruit/frutas`)
        .withHeaders('monitor', false)
        .withJson({
          preco: parseFloat(faker.commerce.price()),
          quantidade: faker.number.int({ min: 1, max: 100 })
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('Dados de entrada inválidos');
    });

    describe('Cadastro de Doces no Mercado', () => {
      it('Cadastro de um novo doce no mercado', async () => {
        doce = await p
          .spec()
          .post(`${baseUrl}/mercado/${mercado}/produtos/padaria/doces`)
          .withHeaders('monitor', false)
          .withJson({
            nome: faker.commerce.productName(),
            preco: parseFloat(faker.commerce.price()),
            quantidade: faker.number.int({ min: 1, max: 100 })
          })
          .expectStatus(StatusCodes.CREATED)
          .expectBodyContains('Produto adicionado com sucesso')
          .returns('_id');
      });
  
      it('Erro ao tentar cadastrar doce sem nome', async () => {
        await p
          .spec()
          .post(`${baseUrl}/mercado/${mercado}/produtos/padaria/doces`)
          .withHeaders('monitor', false)
          .withJson({
            preco: parseFloat(faker.commerce.price()),
            quantidade: faker.number.int({ min: 1, max: 100 })
          })
          .expectStatus(StatusCodes.BAD_REQUEST)
          .expectBodyContains('Erro de validação ou dados faltando');
      });
    });
  
    describe('Cadastro de Salgados no Mercado', () => {
      it('Cadastro de um novo salgado no mercado', async () => {
        salgado = await p
          .spec()
          .post(`${baseUrl}/mercado/${mercado}/produtos/padaria/salgados`)
          .withHeaders('monitor', false)
          .withJson({
            nome: faker.commerce.productName(),
            preco: parseFloat(faker.commerce.price()),
            quantidade: faker.number.int({ min: 1, max: 100 })
          })
          .expectStatus(StatusCodes.CREATED)
          .expectBodyContains('Produto adicionado com sucesso')
          .returns('_id');
      });
  
      it('Erro ao tentar cadastrar salgado sem nome', async () => {
        await p
          .spec()
          .post(`${baseUrl}/mercado/${mercado}/produtos/padaria/salgados`)
          .withHeaders('monitor', false)
          .withJson({
            preco: parseFloat(faker.commerce.price()),
            quantidade: faker.number.int({ min: 1, max: 100 })
          })
          .expectStatus(StatusCodes.BAD_REQUEST)
          .expectBodyContains('Erro de validação ou dados faltando');
      });
    });
  
    describe('Recuperação de Produtos do Mercado', () => {
      it('Recupera frutas de um mercado existente', async () => {
        await p
          .spec()
          .get(`${baseUrl}/mercado/${mercado}/produtos/hortifruit/frutas`)
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.OK)
          .expectBodyContains('Frutas recuperadas com sucesso');
      });
  
      it('Recupera doces de um mercado existente', async () => {
        await p
          .spec()
          .get(`${baseUrl}/mercado/${mercado}/produtos/padaria/doces`)
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.OK)
          .expectBodyContains('Doces recuperados com sucesso');
      });
  
      it('Recupera salgados de um mercado existente', async () => {
        await p
          .spec()
          .get(`${baseUrl}/mercado/${mercado}/produtos/padaria/salgados`)
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.OK)
          .expectBodyContains('Salgados recuperados com sucesso');
      });
  
      it('Erro ao tentar recuperar produtos de um mercado inexistente', async () => {
        const mercadoInexistenteId = 'invalido-id-12345';
        await p
          .spec()
          .get(
            `${baseUrl}/mercado/${mercadoInexistenteId}/produtos/hortifruit/frutas`
          )
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.NOT_FOUND)
          .expectBodyContains('Mercado não encontrado');
      });
    });
  
    describe('Exclusão de Salgados do Mercado', () => {
      it('Exclui um salgado existente do mercado', async () => {
        await p
          .spec()
          .delete(
            `${baseUrl}/mercado/${mercado}/produtos/padaria/salgados/${salgado}`
          )
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.OK)
          .expectBodyContains('Salgado excluído com sucesso');
      });
  
      it('Erro ao tentar excluir um salgado em um mercado inexistente', async () => {
        const mercadoInexistenteId = 'invalido-id-12345';
        await p
          .spec()
          .delete(
            `${baseUrl}/mercado/${mercadoInexistenteId}/produtos/padaria/salgados/${salgado}`
          )
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.NOT_FOUND)
          .expectBodyContains('Mercado não encontrado');
      });
  
      it('Erro ao tentar excluir um salgado inexistente', async () => {
        const salgadoInexistenteId = 'invalido-id-12345';
        await p
          .spec()
          .delete(
            `${baseUrl}/mercado/${mercado}/produtos/padaria/salgados/${salgadoInexistenteId}`
          )
          .withHeaders('monitor', false)
          .expectStatus(StatusCodes.NOT_FOUND)
          .expectBodyContains('Salgado não encontrado');
      });
    });
  
    describe('Cadastro de Farinhas no Mercado', () => {
      it('Cadastro de uma nova farinha no mercado', async () => {
        farinha = await p
          .spec()
          .post(`${baseUrl}/mercado/${mercado}/produtos/mercearia/farinhas`)
          .withHeaders('monitor', false)
          .withJson({
            nome: faker.commerce.productName(),
            preco: parseFloat(faker.commerce.price()),
            quantidade: faker.number.int({ min: 1, max: 100 })
          })
          .expectStatus(StatusCodes.CREATED)
          .expectBodyContains('Farinha cadastrada com sucesso')
          .returns('_id');
      });
  
      it('Erro ao tentar cadastrar farinha sem nome', async () => {
        await p
          .spec()
          .post(`${baseUrl}/mercado/${mercado}/produtos/mercearia/farinhas`)
          .withHeaders('monitor', false)
          .withJson({
            preco: parseFloat(faker.commerce.price()),
            quantidade: faker.number.int({ min: 1, max: 100 })
          })
          .expectStatus(StatusCodes.BAD_REQUEST)
          .expectBodyContains('Erro de validação ou dados faltando');
      });
    });
  
    afterAll(() => p.reporter.end());
  });