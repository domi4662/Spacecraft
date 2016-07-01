let Canvas = document.getElementById("quadro"),
    Ctx = Canvas.getContext("2d");
let larguraTela = Canvas.width;
let alturaTela = Canvas.height;
let nave = [];
let imgFundoTela;
let listaExplosoes = [];
let fim = false;
let vM1, ac1, dac1, mun1, int1, pf1, vM2, ac2, dac2, mun2, int2, pf2;
let listaRastro = [];
let somImpacto;
let backsound = new sound("Music/Soundtrack.mp3").play();
let codigoPad = [];

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = "Sound/" + src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}

function Rastro(posX, posY, dimX, dimY, alpha, qtCopias, direcao, img) {
    this.posX = posX;
    this.posY = posY;
    this.dimX = dimX;
    this.dimY = dimY;
    this.img = img;
    this.alpha = alpha;
    this.qtRestante = qtCopias;
    this.aRedut = alpha / qtCopias;
    this.direc = direcao;
}

function Controle() {
    this.padEsq = false;
    this.padDir = false;
    this.padDisp = false;
    this.padRotEsq = false;
    this.padRotDir = false;
}

function teclaApertada(evento) {

    for (indice = 0; indice < nave.length; indice++) {
        if (codigoPad[indice][evento.keyCode] == "esquerda")
            nave[indice].pad.padEsq = true;
        if (codigoPad[indice][evento.keyCode] == "direita")
            nave[indice].pad.padDir = true;
        if (codigoPad[indice][evento.keyCode] == "tiro")
            nave[indice].pad.padDisp = true;
        if (codigoPad[indice][evento.keyCode] == "girarE")
            nave[indice].pad.padRotEsq = true;
        if (codigoPad[indice][evento.keyCode] == "girarD")
            nave[indice].pad.padRotDir = true;
    }
    if (codigoPad[nave.length][evento.keyCode] == "resetar") {
        console.log(listaRastro.length);
        iniciarMundo();
    }
}

function teclaLiberada(evento) {

    for (indice = 0; indice < nave.length; indice++) {
        if (codigoPad[indice][evento.keyCode] == "esquerda")
            nave[indice].pad.padEsq = false;
        if (codigoPad[indice][evento.keyCode] == "direita")
            nave[indice].pad.padDir = false;
        if (codigoPad[indice][evento.keyCode] == "tiro")
            nave[indice].pad.padDisp = false;
        if (codigoPad[indice][evento.keyCode] == "girarE")
            nave[indice].pad.padRotEsq = false;
        if (codigoPad[indice][evento.keyCode] == "girarD")
            nave[indice].pad.padRotDir = false;
    }
}

function Explosao(posicaoX, posicaoY) {
    this.posX = posicaoX;
    this.posY = posicaoY;
    this.idImg = "explosion";
    this.indiceImg = 0;
    this.img = document.getElementById(this.idImg + 0);
    this.destruir = false;

    this.atualizarAnimacao = function () {
        this.img = document.getElementById(this.idImg + this.indiceImg);
        this.indiceImg++;
        if (this.indiceImg > 11)
            this.destruir = true;
    }
}

function Nave(velocidadeMax, aceleracao, desaceleracao, atrasoDisparo , integridade, potenciaDisparo
             , posicaoY, idImg, dimensaoNaveX, dimensaoNaveY, dimensaoProjetilX, dimensaoProjetilY, corInternaBarra, corExternaBarra) {
    this.vel = 0;
    this.velMax = velocidadeMax/10;
    this.aceler = aceleracao/10;
    this.desaceler = desaceleracao/10;
    this.posX = larguraTela/2;
    this.dimX = dimensaoNaveX;
    this.dimY = dimensaoNaveY;
    this.posY = alturaTela * ((posicaoY == "cima") ? (this.dimY + alturaTela * 0.04) / alturaTela : 1 - ((this.dimY + alturaTela * 0.04) / alturaTela));
    this.dimProjX = dimensaoProjetilX;
    this.dimProjY = dimensaoProjetilY;
    this.idImg = idImg;
    this.img = document.getElementById(idImg + 0);
    this.integ = integridade;
    this.integTotal = integridade;
    this.potDisparo = potenciaDisparo / 10;
    this.pad = new Controle();
    this.listaProjetil = [];
    this.listaProjetilE = [];
    this.atrDispT = 60-2*atrasoDisparo;
    this.atrDisp = 0;
    this.direcIni = (posicaoY == "cima") ? 180 : 0;
    this.direc = 0;
    this.corIntBar = corInternaBarra;
    this.corExtBar = corExternaBarra;
    this.time = posicaoY;

    this.atualizarPosicao = function () {
        if (this.atrDisp > 0)
            this.atrDisp--;
        this.posX += this.vel;
    };

    this.atualizarIntegridade = function (dano) {
        this.integ -= dano;
        switch (true) {
            case this.integ < (this.integTotal * 0.2):
                this.img = document.getElementById(idImg + 4);
                break;
            case this.integ < (this.integTotal * 0.4):
                this.img = document.getElementById(idImg + 3);
                break;
            case this.integ < (this.integTotal * 0.6):
                this.img = document.getElementById(idImg + 2);
                break;
            case this.integ < (this.integTotal * 0.8):
                this.img =  document.getElementById(idImg + 1);
        }
    };

    this.movimentar = function (modAceler, modDirec) {

        if (Math.abs(this.vel) >= this.velMax)
            this.vel = this.velMax * (this.vel > 0) ? 1 : -1;

        if (modAceler == 0) {
            variacao = this.vel/ this.velMax;
            this.vel -= (this.desaceler * variacao);
        }
        else {
            aceler = (modAceler > 0) ? this.aceler : -this.aceler;
            variacao = (this.velMax - Math.abs(this.vel)) / this.velMax;
            this.vel += aceler * variacao;
        }
        switch(modDirec){
            case -1:
                this.direc -= 5;
                break;
            case 0:
                break;
            case 1:
                this.direc += 5;
                break;
            default:
                if(this.direc != 0)
                    this.direc += 5 * ((this.direc>0)?-1:1);
        }
        if (Math.abs(this.direc) >= 45) 
            this.direc = 45 * ((this.direc>0)?1:-1);
    };
}

function Projetil(posicaoX, posicaoY, dimensaoX, dimensaoY, velocidadeX, velocidadeY, potencia, sentido, direcao) {
    this.posX = posicaoX;
    this.posY = posicaoY;
    this.dimX = dimensaoX;
    this.dimY = dimensaoY;
    this.potencia = potencia;
    this.sent = sentido;
    this.velY = velocidadeY * Math.cos(direcao*Math.PI/180);
    this.velX = velocidadeX + Math.abs(velocidadeY) * Math.sin(direcao * Math.PI / 180);
    this.desacelX = 1;
    this.estado = 0;
    this.img = document.getElementById("plasma" + this.estado);
    this.colidiu = false;
    this.destruir = false;
    
    this.atualizarPosicao = function () {
        this.posX += this.velX;
        this.posY += this.velY * this.sent;
        this.estado = (this.estado < 3) ? this.estado+1 : 0 ;
        this.img = document.getElementById("plasma" + this.estado);
        if (this.posY < 0||this.posY > alturaTela) {
            this.destruir = true;
        }
    };

    this.colisao = function (dano) {
        this.potencia -= dano;
        if (this.potencia <= 0)
            this.destruir = true;
    };
}

function iniciarMundo() {

    iniciarVariaveis();
    
    nave.push(new Nave(vM1, ac1, dac1, mun1 , int1, pf1, "baixo", "redSpaceCraft", 64, 64, 35, 40, "red", "blue"));
    nave.push(new Nave(vM2, ac2, dac2, mun2, int2, pf2, "cima", "blackSpaceCraft", 64, 64, 35, 40, "blue", "red"));
  
    window.addEventListener("keydown", teclaApertada);
    window.addEventListener("keyup", teclaLiberada);
}

function iniciarVariaveis() {
    nave = [];
    let indice = Math.floor(Math.random() * 3);
    imgFundoTela = document.getElementById("background" + indice);
    listaExplosoes = [];
    fim = false;
    vM1 = document.getElementById("velM1").innerHTML;
    ac1 = document.getElementById("acel1").innerHTML;
    dac1 = document.getElementById("contr1").innerHTML;
    mun1 = document.getElementById("muni1").innerHTML;
    int1 = document.getElementById("resist1").innerHTML;
    pf1 = document.getElementById("podFogo1").innerHTML;
    vM2 = document.getElementById("velM2").innerHTML;
    ac2 = document.getElementById("acel2").innerHTML;
    dac2 = document.getElementById("contr2").innerHTML;
    mun2 = document.getElementById("muni2").innerHTML;
    int2 = document.getElementById("resist2").innerHTML;
    pf2 = document.getElementById("podFogo2").innerHTML;
    codigoPad[0] = {
        100: "esquerda",
        102: "direita",
        103: "girarE",
        104: "tiro",
        105: "girarD"};
    codigoPad[1] = {
        65: "esquerda",
        68: "direita",
        81: "girarE",
        83: "tiro",
        69: "girarD"
    };
    codigoPad[2] = {82: "resetar"};
}

function desenharRastro(rastro) {
    rastro.qtRestante--;
    if (rastro.qtRestante <= 0)
        return true;
    desenharObjeto(rastro.posX, rastro.posY, rastro.dimX, rastro.dimY, rastro.direc, rastro.alpha, rastro.img);
    rastro.alpha -= rastro.aRedut;
    return false;
}

function desenharBarras(nave, cContorno, cInterno, dim) {
    dist = nave.posY + ((nave.posY < alturaTela / 2) ? -nave.dimY - alturaTela * 0.02 : nave.dimY + alturaTela * 0.01);
    Ctx.beginPath();
    if (nave.integ > 0) {
        comprimento = dim * nave.integ / nave.integTotal;
        Ctx.rect(nave.posX - comprimento, dist, 2 * comprimento, alturaTela * 0.01);
        if (nave.posX > larguraTela - dim)
            Ctx.rect(nave.posX - comprimento - larguraTela, dist, 2 * comprimento, alturaTela * 0.01);
        else if (nave.posX < dim)
            Ctx.rect(nave.posX - comprimento + larguraTela, dist, 2 * comprimento, alturaTela * 0.01);
        Ctx.fillStyle = cContorno;
        Ctx.fill();
        Ctx.lineWidth = 1;
        Ctx.strokeStyle = cInterno;
        Ctx.stroke();
    }
}

function desenhandoDisparos(listaProjetil){
    for (i = 0 ; i < listaProjetil.length ; i++) {
        desenharObjeto(listaProjetil[i].posX, listaProjetil[i].posY, listaProjetil[i].dimX, listaProjetil[i].dimY, 0, 1, listaProjetil[i].img);
        listaRastro.push(new Rastro(listaProjetil[i].posX, listaProjetil[i].posY, listaProjetil[i].dimX, listaProjetil[i].dimY, 0.2, 10, 0, listaProjetil[i].img));
    }
}

function desenharObjeto(posX, posY, dimX, dimY, angulo, alpha, img) {
    Ctx.globalAlpha = alpha;
    Ctx.save();
    Ctx.translate(posX, posY);
    Ctx.rotate(angulo * Math.PI / 180);
    Ctx.drawImage(img, -dimX, -dimY, 2 * dimX, 2 * dimY);
    Ctx.restore();
    Ctx.globalAlpha = 1;
}

function desenharDominioNave(nave){
    angulo = nave.direcIni+(nave.direc * ((nave.direcIni == 0) ? 1 : -1));
    desenharObjeto(nave.posX, nave.posY, nave.dimX, nave.dimY, angulo, 1, nave.img);
    let velMod = Math.abs(nave.vel)/5;
    if(velMod > 3)
    listaRastro.push(new Rastro(nave.posX, nave.posY, nave.dimX, nave.dimY, 0.2, velMod ,nave.direc, nave.img));
    if (nave.posX > larguraTela - nave.dimX)
        desenharObjeto(nave.posX - larguraTela, nave.posY, nave.dimX, nave.dimY, angulo, 1, nave.img);
    else if (nave.posX < nave.dimX)
        desenharObjeto(nave.posX + larguraTela, nave.posY, nave.dimX, nave.dimY, angulo, 1, nave.img);
}

function desenharMundo() {
    if (!fim) {
        //desenhando fundo de tela
        Ctx.drawImage(imgFundoTela, 0, 0, Canvas.width, Canvas.height);


        for (indice = 0 ; indice < listaRastro.length ; indice++)
            if (desenharRastro(listaRastro[indice]))
                listaRastro.splice(indice, indice + 1);

        //desenhando naves
        
        
        for (indice = 0; indice < nave.length; indice++) {
            desenharDominioNave(nave[indice]);
            desenhandoDisparos(nave[indice].listaProjetil);
            desenhandoDisparos(nave[indice].listaProjetilE);
        }


        //desenhando explosões
        for (indice = 0 ; indice < listaExplosoes.length ; indice++) {
            try{
                Ctx.drawImage(listaExplosoes[indice].img, listaExplosoes[indice].posX - 73, listaExplosoes[indice].posY - 82, 146, 163);
                listaExplosoes[indice].atualizarAnimacao();
            } catch (err) {}
        }

        //desenhando barras de integridade
        for (indice = 0; indice < nave.length; indice++)
            desenharBarras(nave[indice], nave[indice].corIntBar, nave[indice].corExtBar, nave[indice].dimX);

    }
}

function telaFim(mensagemFinal, color) {
    for (indice = 0; indice < 3000; indice++) {
        Ctx.beginPath();
        Ctx.rect(0, 0, larguraTela, alturaTela);
        Ctx.globalAlpha = 0.01;
        Ctx.fillStyle = "#000";
        Ctx.fill();
        Ctx.stroke();
    }
        Ctx.font = "60px Arial";
        fim = true;
        Ctx.fillStyle = color;
        Ctx.textAlign = "center";
        Ctx.globalAlpha = 1;
        Ctx.fillText(mensagemFinal, larguraTela/2, alturaTela / 2);
}

function calcularColisao(objetoA, objetoB, margem) {
    return !(objetoA.posX + objetoA.dimX * margem < objetoB.posX - objetoB.dimX * margem ||
             objetoA.posX - objetoA.dimX * margem > objetoB.posX + objetoB.dimX * margem ||
             objetoA.posY + objetoA.dimY * margem < objetoB.posY - objetoB.dimY * margem ||
             objetoA.posY - objetoA.dimY * margem > objetoB.posY + objetoB.dimY * margem);
}

function executarColisaoNave(nave, listaProjetil, margem) {
    //naveA = nave que recebe o projétil
    //naveB = nave que dispara o projétil
    for (i = 0 ; i < listaProjetil.length ; i++) {
        if (calcularColisao(listaProjetil[i], nave, margem)){
            nave.atualizarIntegridade(listaProjetil[i].potencia);
            if (!listaProjetil[i].colidiu) {
                listaProjetil[i].colidiu = true;
                listaExplosoes.push(new Explosao((nave.posX + listaProjetil[i].posX) / 2,
                                                 (nave.posY + listaProjetil[i].posY) / 2));
                somImpacto = new sound("Effects/explosao1.ogg").play();
            }
        }
    }
}

function executarColisaoProjetil(listaProjetilA, listaProjetilB, margem) {
    for (i = 0 ; i < listaProjetilB.length ; i++) {
        for (j = 0 ; j < listaProjetilA.length ; j++) {
            if (calcularColisao(listaProjetilA[j],listaProjetilB[i], margem)){
                listaExplosoes.push(new Explosao((listaProjetilA[j].posX + listaProjetilB[i].posX) / 2,
                                                 (listaProjetilA[j].posY + listaProjetilB[i].posY) / 2));
                somImpacto = new sound("Effects/explosao2.ogg").play();
                let potenciaAuxB = listaProjetilB[i].potencia;
                let potenciaAuxA = listaProjetilA[j].potencia;
                listaProjetilA[j].colisao(potenciaAuxB);
                listaProjetilB[i].colisao(potenciaAuxA);
            }
        }
    }
}

function executarColisoes() {
    let margem = 0.75;
    let qtNaves = nave.length;
    for (indA = 0; indA < qtNaves ; indA++) {
        for (indB = 1 + indA; indB < qtNaves ; indB++) {
            if (nave[indA].time != nave[indB].time) {
                executarColisaoNave(nave[indA], nave[indB].listaProjetil, margem);
                executarColisaoNave(nave[indB], nave[indA].listaProjetil, margem);
                //executarColisaoNave(nave[indA], nave[indB].listaProjetilE, margem);
                //executarColisaoNave(nave[indB], nave[indA].listaProjetilE, margem);
                executarColisaoProjetil(nave[indA].listaProjetil, nave[indB].listaProjetil, margem);
                executarColisaoProjetil(nave[indA].listaProjetil, nave[indB].listaProjetilE, margem);
            }
        }
    }
}

function entradasNave(nave) {
    let modificadorAceleracao = 0,
        modificadorDirecao = null;

    switch (true) {
        case nave.pad.padDir && !nave.pad.padEsq:
            modificadorAceleracao = 1;
            break;
        case !nave.pad.padDir && nave.pad.padEsq:
            modificadorAceleracao = -1;
            break;
        case nave.pad.padDir && nave.pad.padEsq:
        default:
            modificadorAceleracao = 0;
    }
    switch (true) {
        case nave.pad.padRotDir && !nave.pad.padRotEsq:
            modificadorDirecao = 1;
            break;
        case !nave.pad.padRotDir && nave.pad.padRotEsq:
            modificadorDirecao = -1;
            break;
        case nave.pad.padRotDir && nave.pad.padRotEsq:
            modificadorDirecao = 0;
    }
    if (nave.pad.padDisp) {
        if (nave.atrDisp == 0) {
            somImpacto = new sound("Effects/disparo.ogg").play();
            nave.atrDisp = nave.atrDispT;
            nave.listaProjetil.push(new Projetil(nave.posX, nave.posY, nave.dimProjX, nave.dimProjY, nave.vel / 2, 10, nave.potDisparo, ((nave.posY > alturaTela / 2) ? -1 : 1), nave.direc));
            if (nave.posX > larguraTela - 2 * nave.dimProjX)
                nave.listaProjetilE.push(new Projetil(nave.posX - larguraTela, nave.posY, nave.dimProjX, nave.dimProjY, nave.vel / 2, 10, nave.potDisparo, ((nave.posY > alturaTela / 2) ? -1 : 1),0));
            else if (nave.posX < 2 * nave.dimProjX)
                nave.listaProjetilE.push(new Projetil(nave.posX + larguraTela, nave.posY, nave.dimProjX, nave.dimProjY, nave.vel / 2, 10, nave.potDisparo, ((nave.posY > alturaTela / 2) ? -1 : 1),0));
        }
    }
    nave.movimentar(modificadorAceleracao, modificadorDirecao);
}

function atualizarDisparos(listaProjetil){
    for (i = 0 ; i < listaProjetil.length ; i++)
        if (listaProjetil[i].destruir)
            listaProjetil.splice(i, i + 1);
        else
            listaProjetil[i].atualizarPosicao();
}

function calculandoExcedenciaProjetil(nave) {
    for (i = 0; i < nave.listaProjetil.length; i++) {
        if (nave.listaProjetil[i].posX > larguraTela) {
            nave.listaProjetil[i].posX -= larguraTela;
        }
        else
            if (nave.listaProjetil[i].posX < 0) {
                nave.listaProjetil[i].posX += larguraTela;
            }
    }
}

function calculandoExcedenciaNave(nave) {
    if (nave.posX < 0)
        nave.posX += larguraTela;
    else if (nave.posX > larguraTela)
        nave.posX -= larguraTela;
}

function executarRotina(nave) {

}

function atualizarMundo() {
    if (!fim) {
        if (nave[0].integ <= 0) {
            if (nave[1].integ <= 0) {
                telaFim("DRAW","green");
            }
            else {
                telaFim("BLACK SPACECRAFT WIN","blue");

            }
        } else if (nave[1].integ <= 0) {
            telaFim("RED SPACECRAFT WIN","red");
        }
        
        //atualizar naves e disparos
        for (indice = 0; indice < nave.length; indice++) {
            entradasNave(nave[indice]);
            nave[indice].atualizarPosicao();
            calculandoExcedenciaNave(nave[indice]);
            atualizarDisparos(nave[indice].listaProjetil);
            atualizarDisparos(nave[indice].listaProjetilE);
            calculandoExcedenciaProjetil(nave[indice]);
        }

        //limpando explosões
        for (indice = 0 ; indice < listaExplosoes.length ; indice++)
            if (listaExplosoes[indice].destruir)
                listaExplosoes.splice(indice, indice + 1);

        executarColisoes();
    }
}

function gameLoop(tempo) {
            atualizarMundo();
            desenharMundo();
        requestAnimationFrame(gameLoop, Canvas);
}

iniciarMundo();
gameLoop();