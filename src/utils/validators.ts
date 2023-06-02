export const headerRowValidator = (
  row: string[],
  expectedRows: HeaderRow[]
) => {
  if (!row) {
    throw new Error('Row is empty');
  }

  if (row.length !== expectedRows.length) {
    console.log(row.length, expectedRows.length);
    throw new Error('Row length does not match expected row length');
  }
  return true;
};
export const dataRowValidator = (
  row: string[],
  expectedRows: HeaderRow[]
): boolean => {
  if (!row) {
    throw new Error('Row is empty');
  }

  // some objects of expectedRows are required to be present in the row array, so validate that if the required property is true
  for (const expectedRow of expectedRows) {
    if (expectedRow.required) {
      // get index of expectedRow in expectedRows
      const index = expectedRows.indexOf(expectedRow);
      // check if row[index] is empty
      if (!row[index]) {
        throw new Error(
          `Row is missing required column: ${expectedRow.column}`
        );
      }
    }
  }

  return true;
};
