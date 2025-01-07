"use client";

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

import NavBar from "../components/navbar";

import { useState } from "react";

export default function About() {

  return (
    <>
      <NavBar />
      <Container>
        <Space h="sm" />
        <Paper shadow="lg" radius="lg" p="md" withBorder>
          <Title>Rólam</Title>
          <Space h="sm" />
          <Text>
            Bartha-Tóth Benjámin vagyok, 25 éves végzős informatika-angol szakos tanárjelölt az ELTE Eötvös Loránd Tudományegyetemen. Szakdolgozatom címe: „Webalapú feladatgenerátor fejlesztése gráfelméleti feladatokhoz”.
          </Text>
        </Paper>
      </Container>
    </>
  );
}
