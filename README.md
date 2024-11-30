# Semana 8 Estrategia de Pruebas

> [!NOTE]  
> Este repositorio contiene la entrega de la semana 8 del curso de pruebas automatizadas.

**Integrantes**

1. Isaac Alejandro Blanco Amador i.blancoa@uniandes.edu.co
2. Raúl José López Grau rj.lopezg1@uniandes.edu.co
3. Neider Fajardo Hurtado n.fajardo@uniandes.edu.co
4. Juan Camilo Mora Garcia jc.morag12@uniandes.edu.co

## Links de Relevancia

- [Estrategia de Pruebas]()
- [Inventario de Pruebas Manuales Exploratorias](https://docs.google.com/spreadsheets/d/1DP8p5GiagAl7HbPjzf1thdzFkGkWbMSU4DvKUxGeKJ4/edit?gid=0#gid=0)
- [Inventario de Pruebas General](https://github.com/galoryzen/Ghost_Final/blob/main/other_md/inventario_general.md)
  
Resultados:
- [Informe Resultados]()

# Información General

Para la elaboración de las pruebas automatizadas tipo e2e (end-to-end), se hizo uso de la herramienta [Playwright](https://playwright.dev/).

Los archivos de playwright se encuentran en la carpeta [e2e-playwright/](https://github.com/galoryzen/Ghost_Final/tree/main/e2e-playwright).

> [!NOTE]  
> Las pruebas de las que hablaremos se encuentran corriendo en **CI / Github Actions**. Para ver los últimos resultados puede hacerlo desde el apartado de [Actions](https://github.com/galoryzen/Ghost_Final/actions).
>
> Workflows implementados
> - [Playwright Tests](https://github.com/galoryzen/Ghost_Final/blob/main/.github/workflows/playwright.yml) (E2E y DV)

## E2E Tests

Instrucciones para instalar en máquina Linux.

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Instalar dependencias nivel de sistema

- Chromium
- Firefox
- Docker

Instalar playwright browsers:

```bash
npx playwright install
```

Si tiene problemas para instalar siga [la guía oficial de instalación de playwright](https://playwright.dev/docs/intro#installation)

#### 3. Correr las pruebas:

> [!NOTE]  
> El setup de playwright se encargará de levantar una instancia de Ghost


```bash
npm run e2e-firefox
```
> [!TIP]
> Si tiene problemas para instalar o correr playwright [dirígase a la guía de instalación](https://playwright.dev/docs/intro#installation)
> 
> También puede revisar como se ejecutan las pruebas en el archivo [playwright.yml](https://github.com/galoryzen/Ghost_Final/blob/main/.github/workflows/playwright.yml)

## Pruebas de Regresión Visual

Siga las instrucciones descritas para correr [E2E Testing](#e2e-testing) **ignorando el paso 3**, y luego:

```bash
npm run vrt
```

Esto hará que se corran las pruebas en ambas versiones.

Luego para generar el reporte

```bash
npm run vrt-report
```

Puede acceder al archivo `./vrt-report/index.html` para ver los resultados.


## Data Validation Tests

Para correr las pruebas de validación de datos, siga las instrucciones descritas para correr [E2E Testing](#e2e-testing) **ignorando el paso 3**, y luego:

```bash
npm run generate-pool
npm run data-validation
```
