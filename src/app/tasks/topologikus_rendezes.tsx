import { useState } from "react";
import {
  Checkbox,
  NumberInput,
  TextInput,
  Textarea,
  Space,
} from "@mantine/core";
import { DateInput, DatesProvider } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import { rem } from "@mantine/core";

type FormValues = {
  graphNodes: number | null;
  graphEdges: number | null;
  taskTitle: string;
  taskText: string;
  dateChecked: boolean;
  date: Date | null;
};

interface TopologikusRendezesProps {
  form: any;
}

export default function TopologikusRendezes({
  form,
}: TopologikusRendezesProps) {
  const dateIcon = (
    <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
  );

  const [isDateChecked, setIsDateChecked] = useState(false);

  return (
    <>
      <NumberInput
        label="Gráf csúcsainak száma"
        description="Add meg a gráf csúcsainak számát"
        placeholder="Adj meg egy számot"
        min={2}
        max={10}
        withAsterisk
        {...form.getInputProps("graphNodes")}
      />
      <Space h="sm" />
      <NumberInput
        label="Gráf éleinek száma"
        description="Add meg a gráf éleinek számát"
        placeholder="Adj meg egy számot"
        min={2}
        max={10}
        withAsterisk
        {...form.getInputProps("graphEdges")}
      />
      <Space h="sm" />
      <TextInput
        label="A feladat címe"
        description="Add meg a feladat címét"
        placeholder="Adj meg egy feladatcímet"
        withAsterisk
        {...form.getInputProps("taskTitle")}
      />
      <Space h="sm" />
      <Textarea
        label="A feladat szövege"
        description="Add meg a feladat szövegét"
        placeholder="Adj meg egy feladatszöveget"
        withAsterisk
        {...form.getInputProps("taskText")}
      />
      <Space h="sm" />

      <Checkbox
        label="Dátum megadása"
        {...form.getInputProps("dateChecked")}
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          form.setFieldValue("dateChecked", checked);
          if (!checked) {
            form.setFieldValue("date", null);
          }
        }}
      />
      <Space h="sm" />
      {form.values.dateChecked && (
        <DatesProvider settings={{ locale: "hu" }}>
          <DateInput
            leftSection={dateIcon}
            leftSectionPointerEvents="none"
            label="Dátum"
            description="Válaszd ki a generálandó PDF fájlban szereplő dátumot (dolgozatok esetén például)"
            placeholder="Válassz dátumot"
            withAsterisk
            clearable
            {...form.getInputProps("date")}
          />
        </DatesProvider>
      )}
    </>
  );
}
