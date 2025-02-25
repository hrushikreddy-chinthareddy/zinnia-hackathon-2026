import { AmlTrainingItem, ProductTrainingItem, StateTrainingItem } from "../../types/training-education.types"

const generateTraining = <T>(data: T) => (numberOfRows: number): Array<T> => Array(numberOfRows).fill(data)

const mockAmlTrainingItem: AmlTrainingItem = {
  carrier: 'primerica',
  vendor: '0012149A',
  courseNumber: '12458-A',
  courseName: 'AML 2023 CA',
  completionDate: '01/01/2023',
  expirationDate: '01/01/2028',
}
export const generateAmlTraining = generateTraining(mockAmlTrainingItem)

const mockProductTrainingItem: ProductTrainingItem = {
  carrier: 'primerica',
  product: 'AML 2023 CA',
  completionDate: '01/01/2023',
}
export const generateProductTraining = generateTraining(mockProductTrainingItem)

const mockStateTrainingItem: StateTrainingItem = {
  vendor: '0012149A',
  courseNumber: '12458-A',
  courseName: 'AML 2023 CA',
  state: 'CA',
  hours: 10,
  completionDate: '01/01/2023',
  expirationDate: '01/01/2028',
}
export const generateStateTraining = generateTraining(mockStateTrainingItem)

export const generateTableRows = <T>(data: T[], callback: (training: T) => Record<keyof T, React.ReactNode>): Record<keyof T, React.ReactNode>[] => data.map(callback)