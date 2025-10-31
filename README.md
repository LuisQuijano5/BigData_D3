# Proyecto D3.js - Dashboard FIFA 2016 & 2021

<img width="1893" height="994" alt="image" src="https://github.com/user-attachments/assets/f776a99c-6527-4e11-bc8b-87a944305f97" />


## Integrantes
- **Luis Ángel Quijano Guerrero**  
- **Emmanuel Reynaldo Gaspar Lara**  
- **Ulises Andrade González**  
- **Gabriel Josafat Ramírez Reyes**  
- **Juan Pablo Ramírez Ruiz**

**Materia:** Big Data  
**Profesor:** José Jesús Sánchez Farías  
**Instituto Tecnológico de Celaya**  
**Fecha de entrega:** 30 de octubre de 2025  

---

## Introducción

Este proyecto corresponde a la primera práctica del curso de **Big Data**, en la cual se exploró la librería **D3.js (Data-Driven Documents)**.  
El objetivo principal fue comprender su funcionamiento para crear visualizaciones interactivas en la web mediante datos, utilizando HTML, CSS y JavaScript.  

Como aplicación práctica, se desarrolló un **dashboard interactivo** a partir de un **dataset de FIFA (años 2016 y 2021)**, mostrando estadísticas comparativas de los jugadores, equipos y características de rendimiento.  
Durante el desarrollo se experimentó con escalas, ejes, animaciones y elementos SVG, además de la vinculación de datos a través del DOM.  

---

## Objetivo

Diseñar y desarrollar un **dashboard web** interactivo empleando la librería **D3.js**, con el fin de visualizar y analizar información del dataset de FIFA 2016 y 2021.  
El proyecto busca reforzar las habilidades de manipulación del DOM mediante datos, el uso de escalas, transiciones y eventos, así como la comprensión de la importancia de la **visualización de datos en el análisis de información**.

---

## Desarrollo

### Dataset

Los datos usados fueron obtenidos de un dataset de nombre Career Mode player datasets - FIFA 15-21, que son datos del modo de juego de carrera de los jugadores. De ahí, fueron transformados con Python para poder obtener información más relevante e interpretable. Se usaron los datos de las ediciones de 2016 y 2021 para poder observar un contraste y añadir dinámica al dashboard según la edición seleccionada. Contienen información del jugador (nombre corto, altura, peso, nacionalidad, edad) y contractual de cada jugador (club, valor, liga, salario).
Además de esa información básica, el dataset se centra en las calificaciones de rendimiento del juego. Incluye las estadísticas generales de un jugador, como su valoración general (overall) y su potencial de crecimiento (potential). También desglosa atributos muy específicos en categorías como ritmo (pace), tiro (shooting), pases (passing), defensa (defending), físico (physic) y habilidades mentales, proporcionando un perfil completo de las fortalezas y debilidades de cada jugador en el juego.
Con esta información se planteó simular un dashboard que podría usar un analista de un club para analizar jugadores, seleccionando gráficas que se suelen ver en el mundo del football y que permiten realizar interpretaciones valiosas.

### Estructura del Dashboard

```plaintext
Root/
│
├── Data/
│   ├── fifa_2016.csv
│   ├── fifa_2021.csv
│   └── countries-110m.json       → Mapa base en formato TopoJSON
│
├── Src/
│   ├── Charts/              → Funciones para cada gráfica
│   ├── Styles/              → Estilos generales y específicos
│   ├── Utils/               → Funciones reutilizables
│   └── main.js              → Controlador principal del dashboard
│
├── index.html               → Estructura HTML principal
├── .gitignore
└── README.md
```
**Para utilizar D3** simplemente se linkeó el recurso en el HTML, de la misma manera, se agregaron cada uno de los scripts de las gráficas para que fueran de acceso global para el navegador.

<img width="720" height="58" alt="image" src="https://github.com/user-attachments/assets/99cd9323-2e42-4247-8f8e-72e513c07bf7" />

#### index.html
La estructura de la página fue tener un título y opciones para elegir edición y jugador en la parte superior. Justo abajo tener los KPIs seleccionados y obtenidos de la edición seleccionada. Finalmente, las gráficas se distribuyeron en un grid, donde cada celda tiene el mismo tamaño. Además, algunas celdas contenían opciones adicionales para añadir dinamismo local a la gráfica (como editar N para Top N jugadores).

#### Main.js
Este archivo lo usamos como un controlador. Primero se encarga de mantener variables para saber que jugador esta seleccionado actualmente (así no se pierde la selección al cambiar de edición), y un arreglo con los datos de la edición seleccionada (importante para llamar a las gráficas con los datos correctos). Al cargar el DOM, este controlador se encarga de agregar los eventListeners de D3 (.on) a los diferentes controles locales y globales (inputs, filtros, selects), los globales recargan todo el dashboard y los locales solo la gráfica donde se aplican. 

Contiene la función para recargar los KPIs (cantidad de jugadores, media promedio y edad promedio usando la función mean de d3, y valor total también con d3), y para recargar el Dashboard. Esta última función primero carga el archivo correspondiente, y el archivo de topoJson en un promiseAll, de hacerlo exitosamente, los datos se formatean correctamente (a geoJson, a número o hacer anotaciones), luego llama a la función que actualiza los KPIs y finalmente, llama a cada una de las gráficas.

Se hace la nota que todas las funciones de las gráficas requieren que se les mande el containerId de donde se va a colocar el svg, y los datos a usar. Algunos otros requieren un parámetro extra de importancia local para la gráfica (como los datos de geoJson, el tamaño del top, etc.).

#### BarChart.js
Es solo un ejemplo que utilizamos como referencia, construye una gráfica de barras que muestra el ritmo promedio de cada una de las posiciones generales. Es una de las formas más básicas ya que solo se trata de construir los ejes, las barras y el svg. Solo se debe calcular el ritmo promedio haciendo una agrupación y reducción (por posición y sacando la media) con la función rollup de D3.

Es importante destacar que en estas y todas las demás gráficas (excepto la de pastel) se utilizan transiciones para el dibujo de los valores de las gráficas.

#### MapChart.js
La gráfica del mapa requiere que se le mande también los datos de geoJson. Inicia haciendo una agrupación por las nacionalidades de los jugadores (nombres de países) y reducción de la media de los jugadores de dicha nacionalidad, el potencial, la edad y la cantidad de jugadores (todo esto con rollup).

Después pasa a construir el svg, primero elimina cualquier svg anterior y configura las dimensiones. Después pasa a definir la proyección (para pasar de 3d a 2d) y el path que se debe seguir para los trazos. Con esto la función dibuja el mapa usando los datos geográficos, colorea cada país basándose en su promedio de overall (usando una colorScale donde más oscuro el tono de verde mayor promedio) y deja en gris a los países sin datos. Finalmente, añade interactividad, al pasar el ratón sobre un país, muestra un tooltip con el nombre del país y las estadísticas calculadas (promedio de overall, potencial, edad y cantidad de jugadores) o mostrar un mensaje de sin datos.

#### ScatterChart.js
Esta función comienza revisando si el filtro de edad esta seleccionado, en caso de que lo esté, filtra los datos recibidos. Posteriormente calcula el crecimiento de cada uno de los jugadores, ordena los datos según el valor del select (crecimiento o potencial) y filtra el top 100. También se definen las dos escalas, una lineal (para el potencial/crecimiento) y una logarítmica (para el valor de mercado y que no se aplasten todos los valores más cercanos).

La función también se encarga de definir el svg, los ejes (x y y). Además de lo central de la gráfica, que son los puntos. Se utiliza una escala de color (los puntos de jugadores de la misma posición se colorean igual), se calcula su posición con el potencial/crecimiento en la escala lineal x calculada y su valor en la escala logarítmica y calculada, y se agrega un tooltip con información del jugador correspondiente.

#### PercentilChart.js
Esta función comienza limpiando como las demás el svg anterior. Es fundamental que verifique que haya un jugador seleccionado, si no, no debe dibujar nada (retorna). Para calcular los percentiles, se basa en jugadores de su propia liga, cuenta la cantidad de los jugadores a los que es superior en cada una de las estadísticas y lo divide entre el total.

El dibujo de la gráfica es como los demás, debe definir las escalas de x y y (esta es de tipo Band para mappear los atributos con una altura del eje y), dibujar el svg y ejes. Finalmente debe trazar la línea hasta el valor del percentil calculado y colocar un punto ahí y una etiqueta con el valor del percentil un poco a la derecha.

#### RadarChart.js
Esta es la función más compleja, ya que requiere varias consideraciones. Primero, le robó una responsabilidad al main, que es la gestión del input de selección de jugador (incluido poblar las opciones) y de la variable de jugador selección. Además, debe centrar todos los ejes, trazar varios anillos en diferentes radios, ubicar los puntos y tags de las estadísticas usando ángulos y una escala de radio. Luego debe dibujar el polígono que conecta los puntos ubicados usando una curva lineal cerrada y darle el estilo al polígono que resulta del path trazado.

## Funciones D3 Básicas

- **d3.select()**: se usa para seleccionar un conjunto de elementos de DOM, dentro se indica el tipo de elemento a seleccionar, seleccionando el primer elemento coincidente.
- **node()**: permite acceder al nodo DOM puro, no solo la selección como hace el select, permite acceder a métodos nativos de JS.
- **select.append(type)**: es el equvalente a crear un elemento en el DOM con JS que sea hijo del elemento seleccionado.
- **select.attr(nombre, valor)**: establece un atributo con el nobre y valor especificado, por ejemplo, se puede poner ("color", "red") y al objeto seleccionado se le asigna un atributo de color rojo y devuelve esa selección.
- **scaleLinear(dominio, rango)**: construye una escala linear con el dominio rango especificados, y si se especifica un solo elemento, se toma como el rango.
- **.domain()**: son los valores de entrada que se pasan, es decir, es la data como tal que le pasamos, si nuestra gráfica mostrará nombres, entonces esos sería nuestro dominio.
- **.range()**: sería el espacio de pantalla que abarcarán esos datos que pasamos en el domain.
- **scaleBand(dominio, rango)**: covierte strings o datos discretos a posiciones y anchos en bandas dentro de un rango de pixeles.
- **.padding()**: define un espaciado proporcional entre las bandas o puntos, solo se usa para escalas de datos discretos o string como scaleBand.
- **.call()**: permite asignar una función a la selección indicada
- **d3.axisBottom(escala)**: construye el eje de abajo según la escala indicada.
- **d3.axisLeft(escala)**: construye el eje izquierdo según la escala indicada.
- **data(datos)**: vincula la matriz de datos indicada con los elementos seleccionados
- **transition()**: se usa para animar elementos del DOM, en lugar de aplicar directamente los cambios, se interpolan suavemente desde el estado inicial hasta el estado deseado con una duración dada.
- **duration(value)**: se especifica el valor en milisegundos para la duración de la transición
- **delay(value)**: se puede utilizar en milisegundos para todos los elementos seleccionados o mediante una función que recibe como parámetros el dato actual, el índice actual y el grupo actual de nodos del DOM, el elemento devuelto se usa para aplicarle el delay.

## Ejercicios Practicos Desarrollados en Clase

### Top N Jugadores Barchart

Se  hizo una gráfica de barras horizontal, muestra los 10 mejores jugadores según el dataset, clasificando según el nivel medio (overall) de los jugadores. De manera adicional, se coloca un input en el cual se puede seleccionar la cantidad que se puede mostrar en el top con un mínimo de 1 y un máximo de 50, con el fin de hacer que la gráfica sea responsiva.

<img width="870" height="594" alt="Pasted image 20251029173011" src="https://github.com/user-attachments/assets/cdc034c3-e829-4bb6-ad80-8f79e99f0fba" />

El archivo **p_barChart.js** es el que contiene esta gráfica, comienza verificando el topN ingresado mediante el input, para después procesar toda la data que se pasa como parámetro desde el main, de aquí únicamente se extraen los datos de *short_name* y *overall* los cuales después son ordenados de manera descendente y finalmente se extraen los elementos correspondientes al top indicado ya que estos serán los que se graficarán. Para esta gráfica, al igual que en todas, es necesario indicar el id del contenedor HTML para así poder establecer la selección D3 y empezar a trabajar directamente en la creación. Para esta gráfica es necesario crear las escalas en X y en Y ya que será un gráfica de barras horizontal, en el eje X se indica el dominio con los datos overall, mientras que en el eje Y se indica con los nombres de los jugadores; una vez se tienen las escalas, se establecen los ejes haciendo uso de las escalas antes establecidas.

Una vez se cumple con lo anterio, se procede a dibujar las barras en la gráfica, creando elementos "rect" según los datos del top que definimos, en este punto se asigna el alto y ancho para que correspondan con los datos del top con su especifico índice, en esta parte también se le asigna un **transition()** para hacer que los atributos siguientes se apliquen gradualmente y se de el efecto deseado, en este caso, se hizo un efecto de cascada usando un delay. De forma adicional, se le apregaron las etiquetas para cada barra y que la infomación de salida sea más clara.

### Distribución de Nacionalidades - Pie Chart

Se implementó una gráfica de pastel para mostrar la distribución de jugadores por nacionalidad.

La visualización presenta el Top 5 de países con mayor número de jugadores y agrupa el resto bajo la categoría “Otros”, permitiendo observar rápidamente las nacionalidades más comunes en el dataset.

<img width="872" height="573" alt="image" src="https://github.com/user-attachments/assets/24975c33-ec22-45a9-a124-dfcfad813891" />

El archivo piechart_juanpablo.js contiene la función que procesa los datos, agrupa por país y genera la gráfica usando d3.pie() y d3.arc().

Se usa una escala de colores ordinal (d3.scaleOrdinal) basada en d3.schemeGreens, y un efecto hover que resalta los segmentos al pasar el cursor.

Las etiquetas internas muestran el nombre y la cantidad de jugadores cuando la porción supera el 3% del total.

Esta gráfica mantiene coherencia visual con el dashboard general y ofrece una lectura rápida de la diversidad de nacionalidades.
