import CartProvider from "./cart/CartProvider";
import AppRouter from "./router/AppRouter";
import AppToaster from "./components/AppToaster";

function App() {
  return (
    <CartProvider>
      <AppRouter />
      <AppToaster />
    </CartProvider>
  );
}

export default App;
