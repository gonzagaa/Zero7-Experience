/* ==========================================================================
   ZERO7 EXPERIENCE
   Todo o comportamento da pagina, em JavaScript puro. Sem framework, sem
   build, sem dependencia. Tres coisas acontecem aqui:

     1. o acordeao do FAQ
     2. os videos dos cards, que tocam sozinhos quando entram na tela
     3. o efeito magnetico do botao oficial da Zero7

   Nada aqui e essencial para LER a pagina: com o JS desligado o conteudo
   continua todo visivel, a primeira pergunta do FAQ continua aberta e os
   videos ficam no poster.
   ========================================================================== */
(function () {
  "use strict";

  var SEM_MOVIMENTO = "(prefers-reduced-motion: reduce)";

  /* ======================================================================
     1. ACORDEAO DO FAQ
     A marcacao ja vem pronta e acessivel do HTML: <button> de verdade, com
     aria-expanded e aria-controls, e o painel com role="region" e `inert`
     enquanto fechado. Aqui so alternamos o estado.

     Varios podem ficar abertos ao mesmo tempo, de proposito: com abertura
     unica, clicar numa pergunta de baixo fecharia a de cima e a pagina
     saltaria sob o leitor.
     ====================================================================== */
  function ligarAcordeao() {
    var gatilhos = document.querySelectorAll(".faq-trigger");

    Array.prototype.forEach.call(gatilhos, function (gatilho) {
      var painel = document.getElementById(
        gatilho.getAttribute("aria-controls"),
      );
      if (!painel) return;

      gatilho.addEventListener("click", function () {
        var abrindo = gatilho.getAttribute("aria-expanded") !== "true";

        gatilho.setAttribute("aria-expanded", String(abrindo));
        gatilho.classList.toggle("faq-is-open", abrindo);
        painel.classList.toggle("faq-panel-open", abrindo);

        /* `inert` tira o painel fechado da navegacao por teclado e da arvore
           de acessibilidade, sem tirar do DOM (o que impediria a animacao). */
        if (abrindo) painel.removeAttribute("inert");
        else painel.setAttribute("inert", "");
      });
    });
  }

  /* ======================================================================
     2. VIDEOS DOS CARDS
     Rodam mudos, em loop e sem controles.

     Quem manda tocar e um IntersectionObserver, e o preload e "none": sem
     isso os quatro videos comecariam a baixar juntos no load da pagina. Fora
     da tela eles pausam, para nao gastar CPU e bateria a toa.

     Sob prefers-reduced-motion nada toca sozinho, e ai os controles nativos
     aparecem, senao o video ficaria impossivel de ver. Mesma coisa se o
     navegador recusar o autoplay.
     ====================================================================== */
  function ligarVideos() {
    var videos = document.querySelectorAll(".media-video");
    if (!videos.length) return;

    var reduzido =
      window.matchMedia && window.matchMedia(SEM_MOVIMENTO).matches;

    function mostrarControles(video) {
      video.controls = true;
      video.preload = "metadata";
    }

    if (reduzido) {
      Array.prototype.forEach.call(videos, mostrarControles);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(videos, function (video) {
        var p = video.play();
        if (p && p.catch)
          p.catch(function () {
            mostrarControles(video);
          });
      });
      return;
    }

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          var video = entrada.target;
          if (entrada.isIntersecting) {
            var p = video.play();
            if (p && p.catch)
              p.catch(function () {
                mostrarControles(video);
              });
          } else if (!video.paused) {
            video.pause();
          }
        });
      },
      { threshold: 0.25 },
    );

    Array.prototype.forEach.call(videos, function (video) {
      observador.observe(video);
    });
  }

  /* ======================================================================
     3. BOTAO OFICIAL DA ZERO7
     Porte do script de zero7.com.br, com as mesmas constantes: perspectiva
     90rem, lift -0.75rem, ima 1.05rem, tilt 7 graus, sombras 1.2 e 2.4rem.

     So liga em ponteiro fino (nao existe hover no toque) e fora de
     prefers-reduced-motion.
     ====================================================================== */
  function ligarBotoes() {
    var botoes = document.querySelectorAll(".zero7button-btn");
    if (!botoes.length) return;

    var podeEfeito =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia(SEM_MOVIMENTO).matches;
    if (!podeEfeito) return;

    var PERSPECTIVA = 90;
    var LIFT = -0.75;
    var IMA = 1.05;
    var TILT = 7;
    var SOMBRA_1 = 1.2;
    var SOMBRA_2 = 2.4;
    var EPSILON = 0.001;

    function clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    }
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
    function pxPorRem() {
      return (
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 10
      );
    }

    Array.prototype.forEach.call(botoes, function (btn) {
      var tx = 0,
        ty = 0,
        x = 0,
        y = 0;
      var trx = 0,
        tryY = 0,
        rx = 0,
        ry = 0;
      var tmx = 50,
        tmy = 50,
        mx = 50,
        my = 50;
      var tsh1x = 0,
        tsh1y = 0,
        sh1x = 0,
        sh1y = 0;
      var tsh2x = 0,
        tsh2y = 0,
        sh2x = 0,
        sh2y = 0;

      var sobre = false;
      var pressionado = false;
      var animando = false;
      var raf = null;

      function perto(a, b) {
        return Math.abs(a - b) < EPSILON;
      }

      function pararSeParado() {
        var emRepouso =
          perto(x, 0) &&
          perto(y, 0) &&
          perto(rx, 0) &&
          perto(ry, 0) &&
          perto(mx, 50) &&
          perto(my, 50) &&
          perto(sh1x, 0) &&
          perto(sh1y, 0) &&
          perto(sh2x, 0) &&
          perto(sh2y, 0) &&
          !sobre &&
          !pressionado;

        if (!emRepouso) return false;

        animando = false;
        raf = null;
        [
          "--mx",
          "--my",
          "--sh1x",
          "--sh1y",
          "--sh2x",
          "--sh2y",
          "transform",
        ].forEach(function (prop) {
          btn.style.removeProperty(prop);
        });
        return true;
      }

      function atualizar() {
        var t = pressionado ? 0.18 : 0.12;
        x = lerp(x, tx, t);
        y = lerp(y, ty, t);
        rx = lerp(rx, trx, t);
        ry = lerp(ry, tryY, t);

        mx = lerp(mx, tmx, 0.1);
        my = lerp(my, tmy, 0.1);

        var ts = pressionado ? 0.2 : 0.18;
        sh1x = lerp(sh1x, tsh1x, ts);
        sh1y = lerp(sh1y, tsh1y, ts);
        sh2x = lerp(sh2x, tsh2x, ts);
        sh2y = lerp(sh2y, tsh2y, ts);

        btn.style.setProperty("--mx", mx.toFixed(2) + "%");
        btn.style.setProperty("--my", my.toFixed(2) + "%");

        var fator = pressionado ? 0.25 : 1;
        btn.style.setProperty("--sh1x", (sh1x * fator).toFixed(3) + "rem");
        btn.style.setProperty("--sh1y", (sh1y * fator).toFixed(3) + "rem");
        btn.style.setProperty("--sh2x", (sh2x * fator).toFixed(3) + "rem");
        btn.style.setProperty("--sh2y", (sh2y * fator).toFixed(3) + "rem");

        var lift = sobre ? LIFT : 0;
        var escala = pressionado ? 0.985 : sobre ? 1.01 : 1;

        btn.style.transform =
          "perspective(" +
          PERSPECTIVA +
          "rem) " +
          "translate3d(" +
          x.toFixed(3) +
          "rem, " +
          (y + lift).toFixed(3) +
          "rem, 0) " +
          "rotateX(" +
          rx.toFixed(2) +
          "deg) rotateY(" +
          ry.toFixed(2) +
          "deg) " +
          "scale(" +
          escala +
          ")";

        if (pararSeParado()) return;
        raf = requestAnimationFrame(atualizar);
      }

      function iniciar() {
        if (animando) return;
        animando = true;
        raf = requestAnimationFrame(atualizar);
      }

      function zerarAlvos() {
        tx = ty = trx = tryY = 0;
        tmx = tmy = 50;
        tsh1x = tsh1y = tsh2x = tsh2y = 0;
      }

      function definirAlvos(e) {
        var r = btn.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;

        tmx = clamp(px * 100, 0, 100);
        tmy = clamp(py * 100, 0, 100);

        var dx = px - 0.5;
        var dy = py - 0.5;

        tx = dx * IMA;
        ty = dy * IMA;
        trx = clamp(-dy * TILT, -TILT, TILT);
        tryY = clamp(dx * TILT, -TILT, TILT);
        tsh1x = dx * SOMBRA_1;
        tsh1y = dy * SOMBRA_1;
        tsh2x = dx * SOMBRA_2;
        tsh2y = dy * SOMBRA_2;
      }

      function sair() {
        sobre = false;
        pressionado = false;
        zerarAlvos();
        iniciar();
      }

      btn.addEventListener("pointerenter", function () {
        sobre = true;
        iniciar();
      });

      btn.addEventListener("pointermove", function (e) {
        sobre = true;
        definirAlvos(e);
        iniciar();
      });

      btn.addEventListener("pointerleave", sair);
      btn.addEventListener("blur", sair);

      btn.addEventListener("pointerup", function () {
        pressionado = false;
        iniciar();
      });

      btn.addEventListener("pointerdown", function (e) {
        pressionado = true;
        iniciar();

        var r = btn.getBoundingClientRect();
        var onda = document.createElement("span");
        onda.className = "zero7button-ripple";
        onda.style.left = (e.clientX - r.left) / pxPorRem() + "rem";
        onda.style.top = (e.clientY - r.top) / pxPorRem() + "rem";
        btn.appendChild(onda);
        onda.addEventListener("animationend", function () {
          onda.remove();
        });
      });
    });
  }

  /* ======================================================================
     4. SCROLL SUAVE (Lenis)
     A biblioteca esta em script/lenis.min.js, servida do proprio dominio:
     nao ha CDN nem dependencia externa. Se o arquivo faltar, a pagina
     continua rolando normal, com o scroll nativo.

     DESLIGA sob prefers-reduced-motion, e isso nao e detalhe: scroll suave
     sequestra o gesto nativo e e gatilho classico de enjoo em quem tem
     sensibilidade vestibular. Quem pediu menos movimento no sistema
     operacional recebe o scroll do navegador, intacto.

     Toque fica NATIVO de proposito (syncTouch desligado, que e o padrao): o
     momentum do proprio celular e melhor que qualquer imitacao em JS.
     ====================================================================== */
  function ligarScrollSuave() {
    if (typeof Lenis === "undefined") return;
    if (window.matchMedia && window.matchMedia(SEM_MOVIMENTO).matches) return;

    var lenis = new Lenis({
      /* 1.05s e o ponto em que o movimento le como caro e nao como lento.
         Acima de 1.3 o scroll comeca a parecer que esta arrastando. */
      duration: 1.05,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
    });

    function quadro(tempo) {
      lenis.raf(tempo);
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }

  /* ======================================================================
     5. CARD DO PLANO SENIOR
     Substitui o video no quinto card. Entra quando aparece na tela, no mesmo
     gatilho dos videos, e o numero conta ate 80.

     Sob prefers-reduced-motion nao ha contagem nem entrada: o card ja nasce
     montado, com o 80 no lugar. E por isso que o numero esta escrito no HTML
     em vez de ser criado por JS: sem script, ou sem movimento, ele aparece
     igual.
     ====================================================================== */
  function ligarPlano() {
    var cards = document.querySelectorAll(".plano");
    if (!cards.length) return;

    var reduzido =
      window.matchMedia && window.matchMedia(SEM_MOVIMENTO).matches;

    if (reduzido || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(cards, function (card) {
        card.classList.add("plano--visivel");
      });
      return;
    }

    function contar(el) {
      var alvo = parseInt(el.getAttribute("data-contar"), 10);
      if (!alvo) return;
      var duracao = 900;
      var inicio = null;

      function passo(agora) {
        if (inicio === null) inicio = agora;
        var t = Math.min(1, (agora - inicio) / duracao);
        /* Desaceleracao no fim: o numero chega no alvo em vez de bater nele. */
        var suave = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(alvo * suave));
        if (t < 1) requestAnimationFrame(passo);
        else el.textContent = String(alvo);
      }
      el.textContent = "0";
      requestAnimationFrame(passo);
    }

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          var card = entrada.target;
          card.classList.add("plano--visivel");
          var numero = card.querySelector("[data-contar]");
          if (numero) contar(numero);
          observador.unobserve(card); /* acontece uma vez so */
        });
      },
      { threshold: 0.4 },
    );

    Array.prototype.forEach.call(cards, function (card) {
      observador.observe(card);
    });
  }

  function iniciar() {
    ligarAcordeao();
    ligarVideos();
    ligarBotoes();
    ligarScrollSuave();
    ligarPlano();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
