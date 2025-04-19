# Gráf feladat generátor - frontend

Ez a projekt egy webalapú alkalmazás, amely gráfelméleti feladatok generálására szolgál. Az alkalmazás célja, hogy támogassa a gráfelmélet tanítását és tanulását, valamint lehetőséget biztosítson egyedi feladatok gyors és egyszerű előállítására.

## Fő funkciók

- **SVG generálás**: Gráfok vizuális ábrázolása SVG formátumban.
- **PDF generálás**: Feladatok és megoldásaik exportálása PDF formátumban.

## Telepítés és futtatás

1. Klónozd a repót:
   ```bash
   git clone https://github.com/<felhasználónév>/task-generator-frontend.git
   ```
2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```
3. Indítsd el a fejlesztői szervert:
   ```bash
   npm run dev
   ```

## Környezeti változók

Hozz létre egy `.env` fájlt a gyökérkönyvtárban, és add meg a következő változót:

```
NEXT_PUBLIC_BACKEND=<backend_url>
```

## Használt technológiák

- **React** és **Next.js**: Frontend fejlesztéshez.
- **Mantine**: UI komponensekhez.
- **TypeScript**: Típusbiztos kódhoz.

## Fejlesztő

Bartha-Tóth Benjámin

## Licenc

Ez a projekt az Apache License licenc alatt érhető el (lásd: [LICENSE](LICENSE))
