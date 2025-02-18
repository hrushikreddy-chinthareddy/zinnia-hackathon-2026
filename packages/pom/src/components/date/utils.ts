export const handleKeyPressDateCharactersOnly = (e: KeyboardEvent) => {
  const regex = /^[0-9/-]+$/;

  if (!regex.test(e.key)) {
    e.preventDefault();
    return;
  }
};
