"use client";

import { useEffect, useState } from "react";
import {
  Burger,
  Button,
  Container,
  Divider,
  Group,
  Tooltip,
} from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import styles from "./navbar.module.css";

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        close();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [close]);

  if (!mounted) {
    return null;
  }

  return (
    <header>
      <Container size="md">
        <Group align="center" justify="space-between" style={{ marginTop: 10 }}>
          <Group>
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                hiddenFrom="md"
              />
              <Button
                variant="transparent"
                radius="xs"
                color={colorScheme === "dark" ? "white" : "black"}
                onClick={() => router.push("/")}
                style={{
                  fontWeight: 700,
                  color: colorScheme === "dark" ? "white" : "black",
                }}
              >
                GRÁF FELADAT GENERÁTOR
              </Button>
            </Group>

            <Group visibleFrom="md">
              <Button
                className={styles.button}
                variant="subtle"
                radius="xs"
                color="gray"
                onClick={() => router.push("/generator")}
              >
                GENERÁTOR
              </Button>
              {/* <Button
                className={styles.button}
                variant="subtle"
                radius="xs"
                color="gray"
                onClick={() => router.push("/about")}
              >
                RÓLAM
              </Button> */}
            </Group>
          </Group>

          <Group>
            <Tooltip
              label={
                colorScheme === "dark"
                  ? "Váltás világos témára"
                  : "Váltás sötét témára"
              }
              position="left"
              withArrow
            >
              <Button
                className={styles.button}
                variant="subtle"
                radius="xs"
                onClick={() =>
                  setColorScheme(colorScheme === "dark" ? "light" : "dark")
                }
              >
                {colorScheme === "dark" ? (
                  <IconSunFilled size="20" color="#ebb734" />
                ) : (
                  <IconMoonFilled size="20" color="#2c4cdb" />
                )}
              </Button>
            </Tooltip>
          </Group>
        </Group>

        {opened && (
          <Group>
            <Button
              className={styles.button}
              variant="subtle"
              radius="xs"
              color="gray"
              onClick={() => router.push("/generator")}
            >
              GENERÁTOR
            </Button>
            {/* <Button
              className={styles.button}
              variant="subtle"
              radius="xs"
              color="gray"
              onClick={() => router.push("/about")}
            >
              RÓLAM
            </Button> */}
          </Group>
        )}
        <Divider style={{ margin: "10px 0" }} />
      </Container>
    </header>
  );
}
