---
title_es: Ancla ya puede decir qué cambió, fila por fila
title_en: Ancla can now say what changed, row by row
description_es: Guardamos una copia diaria del registro nacional de compras públicas, le calculamos una huella y la anclamos en cadena. Desde hoy también se puede ver qué cambió entre una copia y la siguiente.
description_en: We keep a daily copy of the national procurement record, fingerprint it, and anchor it on chain. From today you can also see what changed between one copy and the next.
date: 2026-09-03
type: articulo
slug: ancla-fila-por-fila
tags: ancla, integridad, sicop, panama
---

--- es ---

## Qué es Ancla

El Estado costarricense publica todas sus compras públicas como datos abiertos. Ese archivo se actualiza todos los días en la misma dirección web, y cuando se vuelve a publicar, la versión anterior deja de existir.

Ancla guarda una copia diaria antes de que eso pase. A cada copia le calcula una huella digital y escribe esa huella en DecentralChain, donde nadie puede modificarla después. Si el archivo se reescribe, hay una copia anterior contra la cual compararlo y una fecha que nadie controla.

Hoy conserva 190 archivos mensuales, de diciembre de 2010 a septiembre de 2026, unos seis millones de registros. Más de 400 huellas están ancladas en cadena. Operarlo cuesta menos de un dólar al año.

## Qué cambió desde agosto

El 27 de agosto publicamos que cinco veces se habían reescrito archivos de meses ya cerrados, catorce meses en total. Ese texto terminaba reconociendo un límite: sabíamos que los archivos cambiaron, no qué cambió dentro de ellos. Una huella cubre el archivo completo, no cada fila.

Eso ya está resuelto. Ancla ahora conserva cada versión entera, las compara fila por fila, y publica el resultado como un paquete que cualquiera puede rehacer y verificar por su cuenta.

## Cómo funciona

Cuatro pasos, todos los días:

1. **Copiar.** Se descarga el archivo del mes y se guarda sin sobrescribir nada. Una copia nueva se guarda al lado de la anterior, nunca encima.
2. **Reducir.** Cada registro se convierte en dos huellas: una que cambia si cambia cualquier cosa, y otra que ignora las diferencias de formato. Un monto publicado como `1.000` y republicado como `1` es el mismo monto escrito distinto, y contarlo como una alteración sería ruido.
3. **Anclar.** Todas las huellas del mes se combinan en una sola de 64 caracteres y se escribe en DecentralChain. La cadena no guarda contratos ni nombres ni montos: guarda la huella, la cantidad de registros y la fecha.
4. **Comparar.** Si el archivo se reescribe, se compara con la copia anterior y se clasifica cada diferencia: registro nuevo, modificación declarada por la fuente, revisión silenciosa, retiro, o solo un cambio de formato.

## Qué se puede ver hoy

En [decentralamerica.com/evidencia](/evidencia/versions.html) están todas las copias guardadas, la huella de cada una, y si esa huella ya está comprometida en cadena.

Donde hay dos copias del mismo período, la página muestra la comparación. Empieza por lo que suele importar: qué campos se movieron y de qué manera. En la comparación de agosto de 2026, entre la copia del día 26 y la del 31, hay 7.592 revisiones silenciosas, 3.678 registros retirados, y 117 filas donde se movió un monto. Ese último número es el que un lector busca, y era imposible de encontrar leyendo una lista de 260.000 cambios.

La página no le pide que confíe en ella. La huella se vuelve a calcular en su propio navegador y se compara contra lo que dice la cadena, leyendo el nodo público directamente. Si nuestro servidor alterara un solo número, la comprobación fallaría en su pantalla.

## Para quién es útil

Para un proveedor que quiere saber si el registro de su licitación cambió después de publicarse. Para una periodista siguiendo una contratación. Para un abogado que presentó un recurso y necesita el estado del expediente en una fecha concreta. Para una auditora que necesita citar una versión y no la actual.

Y para cualquier persona que quiera comprobar por su cuenta que el registro público dice hoy lo mismo que decía ayer.

## Qué demuestra y qué no

Ancla demuestra que un registro publicado cambió, y desde cuándo. Eso es todo lo que demuestra.

No demuestra que un cambio fuera indebido. Corregir un dato mal cargado produce exactamente la misma señal que alterarlo a propósito, y desde afuera se ven igual. No detecta corrupción: detecta cambios.

Tampoco puede auditar el pasado. El anclaje establece integridad hacia adelante, desde el día en que empieza. De los catorce meses reescritos antes de agosto de 2026, no existe copia anterior en ningún lado, y eso es permanente. La herramienta lo dice así, período por período, en vez de disimularlo.

Y solo ve lo que se publica. La Contraloría estimó que en 2021 el 27,1 % del monto adjudicado se movió fuera de la plataforma. Eso Ancla no puede medirlo: no se detecta una ausencia en un conjunto de datos que solo registra presencias.

## De dónde vienen los datos

De SICOP, del Ministerio de Hacienda, y de SIAC, de la Contraloría General de la República. Los republica el Observatorio de Compra Pública en `observatoriocomprapublica.go.cr`, que los publica para "análisis, seguimiento, fiscalización y el desarrollo de nuevas aplicaciones". Es exactamente ese uso, con los datos tal como el Estado los entrega.

Ancla no es un proyecto del Estado. Los datos sí lo son. Esa distinción es el punto: un instrumento de fiscalización operado por la institución observada no prueba nada. El valor está en que nadie en Hacienda puede cambiar lo que Ancla ya registró, y nosotros tampoco.

Todo el código es abierto, con licencia MIT.

## Qué sigue

Panamá entró el 3 de septiembre. Son 37 meses de PanamaCompra desde septiembre de 2023, con el mismo tratamiento y las mismas huellas en la misma cuenta. Todavía no se ha reescrito ningún período panameño, que es la buena noticia: no hay nada que comparar.

Honduras queda por ahora afuera. Su portal sirve un certificado vencido desde el 5 de julio de 2026, así que la descarga no se puede autenticar, y sin eso una copia solo demuestra que alguien nos entregó unos bytes. Guatemala publica los datos pero exige pasar un control de acceso que su operador activó a propósito; el camino ahí es pedir acceso, no esquivarlo. El Salvador y Nicaragua no publican un archivo masivo, así que ninguna herramienta puede alcanzarlos.

Queda una pregunta más grande que el software. Quien tiene la llave que firma las huellas es la credibilidad del sistema, y hoy esa llave es nuestra. Debería estar en manos de una institución sin interés en los resultados de las compras públicas: una universidad, un colegio profesional, una redacción. Esa es una decisión de gobernanza, no de ingeniería, y es el riesgo abierto más grande del proyecto.

--- en ---

## What Ancla is

The Costa Rican state publishes all of its public procurement as open data. That file is updated every day at the same web address, and when it is published again, the previous version stops existing.

Ancla keeps a daily copy before that happens. It fingerprints each copy and writes that fingerprint to DecentralChain, where nobody can change it afterwards. If the file is rewritten, there is an earlier copy to compare it against and a date nobody controls.

It now holds 190 monthly archives, December 2010 to September 2026, around six million records. More than 400 fingerprints are anchored on chain. Running it costs under a dollar a year.

## What changed since August

On 27 August we published that archives of already-closed months had been rewritten five times, fourteen months in total. That piece ended by admitting a limit: we knew the files had changed, not what changed inside them. A fingerprint covers the whole file, not each row.

That is now solved. Ancla keeps every full version, compares them row by row, and publishes the result as a bundle anyone can rebuild and check themselves.

## How it works

Four steps, every day:

1. **Copy.** The month's archive is downloaded and stored without overwriting anything. A new copy is stored beside the old one, never on top of it.
2. **Reduce.** Each record becomes two fingerprints: one that moves if anything at all moves, and one that ignores formatting. An amount published as `1.000` and republished as `1` is the same amount written differently, and reporting that as tampering would be noise.
3. **Anchor.** Every fingerprint in the month folds into a single 64-character one, written to DecentralChain. The chain holds no contracts, no names, no amounts: it holds the fingerprint, a record count, and a date.
4. **Compare.** If the archive is rewritten, it is compared against the previous copy and every difference is classified: new record, amendment the source declared, silent revision, withdrawal, or formatting only.

## What you can see today

[decentralamerica.com/evidencia](/evidencia/versions.html) lists every copy held, the fingerprint of each, and whether that fingerprint is committed on chain.

Where two copies of the same period exist, the page shows the comparison. It leads with what usually matters: which fields moved, and how. In the August 2026 comparison, between the copy served on the 26th and the one served on the 31st, there are 7,592 silent revisions, 3,678 withdrawn records, and 117 rows where an amount moved. That last number is the one a reader is looking for, and it was unfindable by scrolling a list of 260,000 changes.

The page does not ask you to trust it. The fingerprint is recomputed in your own browser and checked against the chain, reading the public node directly. If our server altered a single number, the check would fail on your screen.

## Who it is useful for

A supplier who wants to know whether the record of their tender changed after publication. A journalist following a contract. A lawyer who filed an objection and needs the state of the file on a specific date. An auditor who needs to cite a version rather than the current one.

And anyone who wants to check for themselves that the public record still says today what it said yesterday.

## What it proves and what it does not

Ancla proves that a published record changed, and from when. That is the entire claim.

It does not prove any change was improper. Correcting a badly loaded field produces exactly the same signal as altering one on purpose, and from outside they look identical. It does not detect corruption: it detects change.

It cannot audit the past either. Anchoring establishes integrity forward, from the day it starts. For the fourteen months rewritten before August 2026, no earlier copy exists anywhere, and that is permanent. The tool says so, period by period, rather than papering over it.

And it only sees what gets published. The Contraloría estimated that in 2021, 27.1% of awarded value moved outside the platform. Ancla cannot measure that: you cannot detect an absence in a dataset that only records presence.

## Where the data comes from

From SICOP, run by the Ministerio de Hacienda, and SIAC, run by the Contraloría General de la República. Both are republished by the Observatorio de Compra Pública at `observatoriocomprapublica.go.cr`, which publishes them for "análisis, seguimiento, fiscalización y el desarrollo de nuevas aplicaciones". This is exactly that use, on the data as the state hands it over.

Ancla is not a state project. The data is. That distinction is the point: an oversight instrument operated by the institution being observed proves nothing. The value is that nobody at Hacienda can change what Ancla already recorded, and neither can we.

All the code is open, MIT licensed.

## What comes next

Panamá joined on 3 September. That is 37 months of PanamaCompra since September 2023, with the same treatment and the same fingerprints on the same account. No Panamanian period has been rewritten yet, which is the good outcome: there is nothing to compare.

Honduras is out for now. Its portal has served an expired certificate since 5 July 2026, so the download cannot be authenticated, and without that a copy only proves somebody handed us some bytes. Guatemala publishes the data but requires passing an access control its operator turned on deliberately; the route there is to request access, not to work around it. El Salvador and Nicaragua publish no bulk archive at all, so no tool can reach them.

One question remains that is larger than the software. Whoever holds the key that signs the fingerprints is the credibility of the system, and today that key is ours. It belongs with an institution that has no stake in procurement outcomes: a university, a professional college, a newsroom. That is a governance decision rather than an engineering one, and it is the largest open risk in the project.
