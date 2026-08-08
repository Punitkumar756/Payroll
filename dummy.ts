interface User { name: string; age: number; }
const greet = (u: User): string => {
  return "Hello " + u.name;
};
export default greet;
