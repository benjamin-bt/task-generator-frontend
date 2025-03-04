"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Space,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import NavBar from "./components/navbar";

import styles from "./components/buttons.module.css";

export default function MainPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(
      /* 'http://localhost:8000/api/message' */ `${process.env.NEXT_PUBLIC_BACKEND}/api/message`
    )
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  /* console.log(message); */

  return (
    <>
      <NavBar />
      <Container>
        <Space h="sm" />
        <Paper shadow="lg" radius="lg" p="md" withBorder>
          <Title>Kezdőlap</Title>
          <Space h="sm" />
          <Text>
            Ez az oldal az ELTE Eötvös Loránd Tudományegyetem Informatika
            Karának informatika tanárképző szakán készített szakdolgozatom
            részeként jött létre. A szakdolgozat címe: „Webalapú
            feladatgenerátor fejlesztése gráfelméleti feladatokhoz”. Az oldal
            célja, hogy támogassa a gráfelmélet tanítását és tanulását,
            praktikus eszközt nyújtva hallgatók számára a gyakorláshoz, valamint
            tanároknak az egyedi feladatok gyors és egyszerű előállításához.
          </Text>
          <Space h="sm" />
          <Text>
            A feladatgenerátor jelenleg három típusú feladat létrehozását
            támogatja: mélységi bejárás, szélességi bejárás és topologikus
            rendezés. A generált feladatok és megoldásaik PDF formátumban
            külön-külön letölthetők, így a tanulók önállóan is ellenőrizhetik
            megoldásaikat, míg a tanárok könnyedén előkészíthetik az órákhoz
            szükséges anyagokat.
          </Text>
          <Space h="sm" />
          <Text>
            A generátor számos testreszabási lehetőséget kínál, hogy a feladatok
            megfeleljenek a különböző tanítási és tanulási igényeknek. Megadható
            például a gráf típusa, csúcsainak és éleinek száma és a feladathoz
            tartozó szöveges instrukciók is. Ez a rugalmasság biztosítja, hogy a
            feladatok mindig az adott tanulócsoport szintjéhez és céljaihoz
            igazíthatók legyenek. Próbáld ki a generátort, és fedezd fel, hogyan
            könnyítheti meg a gráfelméleti feladatok tanítását és gyakorlását!
          </Text>

          <Space h="lg" />
          <Group justify="center" align="center">
            <button
              className={styles.buttonMain}
              role="button"
              onClick={() => router.push("/generator")}
              style={{ width: "50%" }}
            >
              Generálj feladatot
            </button>
          </Group>
          <Space h="md" />
        </Paper>
      </Container>
    </>
  );
}
