export type AmlTrainingItem = {
  carrier: string,
  vendor: string,
  courseNumber: string,
  courseName: string,
  completionDate: string,
  expirationDate: string,
}


export type StateTrainingItem = {
  vendor: string,
  courseNumber: string | string[],
  courseName: string,
  state: string,
  hours: number,
  completionDate: string,
  expirationDate: string,
}

export type ProductTrainingItem = {
  carrier: string,
  product: string | string[],
  completionDate: string,
}

export type TrainingEducation = AmlTrainingItem & StateTrainingItem & ProductTrainingItem;