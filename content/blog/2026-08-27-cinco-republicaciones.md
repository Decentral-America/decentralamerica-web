---
title_es: Cinco republicaciones, catorce meses cerrados reescritos
title_en: Five republications, fourteen closed months rewritten
description_es: El espejo de Ancla registra cinco fechas en las que archivos mensuales ya cerrados volvieron a publicarse. Lo que eso demuestra, y lo que no.
description_en: Ancla's mirror records five dates on which already-closed monthly archives were published again. What that proves, and what it does not.
date: 2026-08-27
type: hallazgo
slug: cinco-republicaciones-catorce-meses
tags: ancla, integridad, sicop
---

--- es ---

## Qué se observó

El espejo de Ancla conserva 189 archivos mensuales del registro nacional de compras públicas, desde diciembre de 2010 hasta agosto de 2026. Un archivo mensual se cierra el último día de su mes. A partir de ahí no debería volver a escribirse.

Cinco veces se volvió a escribir.

- **2024-09-20** — 7 meses republicados, `2024-01 … 2024-08`, 144.5 MB
- **2024-10-03** — 1 mes republicado, `2024-07`, 13.8 MB
- **2024-10-04** — 1 mes republicado, `2024-09`, 51.1 MB
- **2025-05-06** — 3 meses republicados, `2025-02 … 2025-04`, 105.2 MB
- **2026-08-10** — 2 meses republicados, `2026-06 … 2026-07`, 105.7 MB

Catorce archivos de meses ya cerrados, publicados de nuevo en la misma dirección, sin aviso y sin registro de qué cambió. La versión anterior de cada uno dejó de existir en el origen.

## Cómo se detectó

Ancla descarga el registro todos los días, reduce cada archivo mensual a una huella y ancla esa huella en cadena. Dos huellas distintas para el mismo mes cerrado significan que el archivo se reescribió entre una lectura y la siguiente.

El conjunto de 2022 queda fuera de este conteo. Corresponde a la carga inicial del espejo, no a una republicación en el origen, y contarlo inflaría el resultado.

## Qué demuestra esto

Que los archivos cambiaron. Nada más.

No demuestra que algún cambio fuera indebido. La corrección de un dato mal cargado produce exactamente la misma señal que una alteración deliberada, y desde afuera las dos se ven igual. Tampoco identifica qué filas cambiaron: la huella cubre el archivo completo, no cada uno de sus seis millones de registros por separado.

Lo que sí queda fijado es la fecha. Desde el 2026-08-27 cualquier republicación futura queda registrada en el momento en que ocurre, con una huella anterior contra la cual compararla. Esa comparación es la que hasta hoy no existía en ninguna parte.

## Qué falta

Responder *qué cambió* exige conservar cada versión completa y compararlas fila por fila. Es trabajo en curso. Cuando exista, se publicará aquí con esta misma estructura: qué se observó, cómo se detectó, y qué demuestra.

--- en ---

## What was observed

Ancla's mirror holds 189 monthly archives of the national procurement record, from December 2010 to August 2026. A monthly archive closes on the last day of its month. After that it should never be written again.

Five times it was written again.

- **2024-09-20** — 7 months republished, `2024-01 … 2024-08`, 144.5 MB
- **2024-10-03** — 1 month republished, `2024-07`, 13.8 MB
- **2024-10-04** — 1 month republished, `2024-09`, 51.1 MB
- **2025-05-06** — 3 months republished, `2025-02 … 2025-04`, 105.2 MB
- **2026-08-10** — 2 months republished, `2026-06 … 2026-07`, 105.7 MB

Fourteen archives of already-closed months, published again at the same address, with no notice and no record of what changed. The previous version of each one stopped existing at the source.

## How it was detected

Ancla downloads the record every day, reduces each monthly archive to a fingerprint, and anchors that fingerprint on chain. Two different fingerprints for the same closed month mean the archive was rewritten between one reading and the next.

The 2022 cluster is excluded from this count. It is the mirror's initial load rather than a republication at the source, and counting it would inflate the result.

## What this proves

That the archives changed. Nothing beyond that.

It does not prove that any change was improper. Correcting a badly loaded field produces exactly the same signal as a deliberate alteration, and from outside the two look identical. It also does not identify which rows changed: the fingerprint covers the whole archive, not each of its six million records separately.

What it does fix is the date. From 2026-08-27 on, any future republication is recorded as it happens, with an earlier fingerprint to compare it against. That comparison is the thing that did not exist anywhere until now.

## What is missing

Answering *what changed* requires keeping every full version and comparing them row by row. That work is under way. When it exists it will be published here in this same shape: what was observed, how it was detected, and what it proves.
