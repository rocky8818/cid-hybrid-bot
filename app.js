const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require("path")
const fs = require("fs")
const axios = require('axios')

const chat = require("./chatGPT")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

const introPath = path.join(__dirname, "mensajes", "introduccion.md")
const intro = fs.readFileSync(introPath, "utf8")

const pathConsultas = path.join(__dirname, "mensajes", "promptConsultas.md")
const promptConsultas = fs.readFileSync(pathConsultas, "utf8")

const flowNewReport = addKeyword('Enviar Reporte')
    .addAnswer((ctx, [gotoFlow]) => {
        return gotoFlow(flowReporte)
    })

const testReport = addKeyword('sprReport')
.addAction(async(ctx) =>{
    const report = {
        empresa: 'cid',
        telefono: '8272366329',
        contacto: 'ricardo',
        correo: 'devœcid',
        descripcion: 'test de report wa',
        tema: 'Correos',
        impacto: 'myState.impacto',
        so: 'mac',
        dispositivo: 'desktop',
        prioridad: 'Alta',
        adicional: 'myState.adicional',
        from: 'Whatsapp',
        estado: 'Pausa'
    };
    console.log(report);

    try {
        const response = await axios.post(process.env.TICKETS_API, report);
    } catch (error) {
        console.error('Error al enviar el reporte:', error);
    }
})

const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('Este es el flow consultas')
    .addAnswer("Hace tu consulta", { capture: true }, async (ctx, ctxFn) => {
        const prompt = promptConsultas
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)
    })

const flowIntro = addKeyword(EVENTS.ACTION)
    .addAnswer(intro)

const flowAgencia = addKeyword(EVENTS.ACTION)
    .addAnswer('En la agencia de cid manejamos servicios como desarrollo web, branding, foto y video, arquitectura e interiorismo entre otros.', {
        delay: 3000
    })
    .addAnswer('Puedes encontrar más información de estos servicios en nuestra página web agencia.cid.mx o puedes preguntar en este chat eligiendo la opción 5 en el menú.', {
        delay: 4000
    })
    .addAnswer('Nos encantaría trabajar contigo!', {
        media: 'https://i.pinimg.com/564x/6c/ae/9b/6cae9b731a26eeefdb3ae01be62f7d9b.jpg',
        delay: 2000
    })

const flowEscuela = addKeyword(EVENTS.ACTION)
    .addAnswer('En el apartado de escuela tenemos cursos donde obtendrás conocimientos sobre las herramientas más utilizadas de diseño. Con cursos como photoshop, ilustrador o autocad.', {
        delay: 3000
    })
    .addAnswer('Si te interesa conocer más sobre la escuela puedes preguntar en la opción cuatro del menú *Que cursos maneja la escuela de cid* ó visita nuestra página web escuela.cid.mx', {
        delay: 4000
    })
    .addAnswer('Con nuestros cursos nunca dejarás de aprender!', {
        media: 'https://i.pinimg.com/564x/6c/ae/9b/6cae9b731a26eeefdb3ae01be62f7d9b.jpg',
        delay: 2000
    })


const menuFlow = addKeyword(EVENTS.WELCOME).addAnswer(
    menu, { 
        capture: true,
        delay: 3000,
     },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "5", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no válida, por favor envía (0, 1, 2, 3, 4 ó 5)."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowIntro);
            case "2":
                return gotoFlow(flowAgencia);
            case "3":
                return gotoFlow(flowEscuela);
            case "4":
                return gotoFlow(flowReporte);
            case "5":
                return gotoFlow(flowConsultas)
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
                );
        }
    }
);

const flowReporte = addKeyword(['reporte'])
    .addAnswer(
        ['Hola 👋, sentimos que estés teniendo problemas, pero intentaremos resolverlo.',, 'A continuación haremos unas preguntas ❔ para recaudar información de tu problema y atenderlo de la mejor manera.🧐']
    )
    .addAnswer(
        'Si en algún momento deseas salir del flujo ❌ y no enviar el reporte, envía *cancelar*. '
    )
    .addAnswer(
        ['¿De qué empresa te estás comunicando?🏭'],
        {
            capture: true,
            idle: 3000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ empresa: ctx.body });
            await state.update({ telefono: ctx.from });
        }
    )
    .addAnswer(
        ['👷¿Cuál es tu nombre?👷‍♀️'],
        {
            capture: true,
            idle: 30000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ contacto: ctx.body });
        }
    )
    .addAnswer(
        ['¿Cuál es tu correo?📭', , 'Recuerda que si deseas salir del flujo, puedes envíar *cancelar*'],
        {
            capture: true,
            idle: 300000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ correo: ctx.body });
        }
    )
    .addAnswer(
        '¿Qué problemas tienes?✍️',
        {
            capture: true,
            idle: 300000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ descripcion: ctx.body });
        }
    )
    .addAnswer(
        ['A cual de estos temas relacionas tu problema? 📚', '', 'Correos, Web, Aplicaciones, Redes'],
        async (ctx, { fallBack }) => {
            if (!["Correos", "Web", "Aplicaciones", "Redes", "Cancelar", "cancelar"].includes(ctx.body)) {
                return fallBack(
                    "Respuesta no válida, por favor envía (Correos, Web, Aplicaciones, Redes, Cancelar)."
                );
            }
        }
    )
    .addAnswer(
        '¿Nos puedes contar como te está afectando el problema?📈',
        {
            capture: true,
            idle: 300000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ impacto: ctx.body });
        }
    )
    .addAnswer(
        '💻¿En qué software estás encontrando el problema el problema? (windows, mac, linux, android, ios, no aplica)',
        {
            capture: true,
            idle: 300000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ so: ctx.body });
        }
    )
    .addAnswer(
        '¿En qué tipo de dispositivo encontró el problema?📱 (Desktop, tablet, celular, no aplica)',
        {
            capture: true,
            idle: 300000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ dispositivo: ctx.body });
        }
    )
    .addAnswer(
        '¿Cuál prioridad describiría mejor el problema?🚦 (Baja, media, alta)',
        {
            capture: true,
            idle: 300000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ prioridad: ctx.body });
        }
    )
    .addAnswer(
        '¿Tiene alguna información adicional que nos ayude a tener un mejor panorama 🌄 del problema?🗣️',
        {
            capture: true,
            idle: 3000
        },
        async (ctx, { state, endFlow, gotoFlow }) => {
            if(ctx.body == 'Cancelar' || ctx.body == 'cancelar'){
                return endFlow({body: 'Tu reporte ha sido cancelado ❌'})
            }
            if(ctx?.idleFallBack){
                return gotoFlow
            }(flujoFinal)
            await state.update({ adicional: ctx.body });
            const myState = state.getMyState();

            const report = {
                empresa: myState.empresa,
                telefono: myState.telefono,
                contacto: myState.contacto,
                correo: myState.correo,
                descripcion: myState.descripcion,
                tema: myState.tema,
                impacto: myState.impacto,
                so: myState.so,
                dispositivo: myState.dispositivo,
                prioridad: myState.prioridad,
                adicional: myState.adicional,
                from: 'Whatsapp',
                estado: 'Abierto'
            };
            console.log(report);
            await state.update({ resp: 'Pronto nos comunicaremos contigo' });

            try {
                const response = await axios.post(process.env.TICKETS_API, report);
                const ticketId = response.data.id;
                await state.update({ resp: `Listo🤖, tu número de ticket es ${ticketId}` });
            } catch (error) {
                console.error('Error al enviar el reporte:', error);
            }
        }
    )
    .addAnswer(
        'Hemos recibido tu reporte!',
        null,
        async (ctx, { flowDynamic, state }) => {
            const resp = state.get('resp');
            await flowDynamic(`${resp}`);
        }
    );

const flujoFinal = addKeyword(EVENTS.ACTION).addAnswer('No recibimos tu respuesta y se canceló la solicitud.')

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowConsultas, menuFlow, flowReporte, flujoFinal, testReport, flowNewReport])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
