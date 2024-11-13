export type User = {
  id: string; name: string; password: string; firstName: string | null; lastName: string | null; age: string | null; grade: string | null; profileUpdated: boolean; createdAt: Date; updatedAt: Date;
};

export type SignupFormValues = {
  name: string;
  password: string;
  confirmPassword: string;
};


export type loginFormValues = {
  name: string;
  password: string;
};

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  age: string;
  grade: string;
};
export type CardDetailsFormValues = {
  card_number: number;
  cardName: string;
  expireMonth: string;
  expireYear: number;
  cardCVC: number;
};
