import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./src/screens/home";
import Kaydol from "./src/screens/register";
import Unuttum from "./src/screens/unuttum";
import Dashboard from "./src/screens/kullanici/dashboard";
import Hesabim from "./src/screens/kullanici/hesabim";
import Kampanyalar from "./src/screens/kullanici/kampanyalar";
import Menu from "./src/screens/kullanici/menu";
import Qr from "./src/screens/kullanici/qr";
import Tercihlerim from "./src/screens/kullanici/tercihlerim";
import ProfilDuzenle from "./src/screens/kullanici/Editprofile";
import HesapHareketleri from "./src/screens/kullanici/siparisgecmisi";
import Kuponlarim from "./src/screens/kullanici/kuponlarim";
import AlerjenListesi from "./src/screens/kullanici/alerjenlist";
import YardimDestek from "./src/screens/kullanici/help";
import CoffeeDetail from "./src/screens/kullanici/CoffeeDetail";
import PromoDetail from "./src/screens/kullanici/promodetail";
import Menumuz from "./src/screens/menumuz";



const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Kaydol" component={Kaydol} />
                <Stack.Screen name="Unuttum" component={Unuttum} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Hesabim" component={Hesabim} />
                <Stack.Screen name="Kampanyalar" component={Kampanyalar} />
                <Stack.Screen name="Menu" component={Menu} />
                <Stack.Screen name="Qr" component={Qr} />   
                <Stack.Screen name="Tercihlerim" component={Tercihlerim} /> 
                <Stack.Screen name="ProfilDuzenle" component={ProfilDuzenle} />
                <Stack.Screen name="HesapHareketleri" component={HesapHareketleri} />
                <Stack.Screen name="Kuponlarim" component={Kuponlarim} />
                <Stack.Screen name="AlerjenListesi" component={AlerjenListesi} />
                <Stack.Screen name="YardimDestek" component={YardimDestek} />
                <Stack.Screen name="promodetail" component={PromoDetail} /> 
                <Stack.Screen name="CoffeeDetail" component={CoffeeDetail} />    
                <Stack.Screen name="Menumuz" component={Menumuz} />      
            </Stack.Navigator>
        </NavigationContainer>
    );
}
