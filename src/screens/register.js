import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import AppService from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!formData.name || !formData.surname || !formData.email || !formData.password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const response = await AppService.kayitOl(
        formData.name, 
        formData.surname, 
        formData.email, 
        formData.password
      );
      
      if (response.success) {
        Alert.alert('Başarı', 'Kayıt işlemi başarıyla tamamlandı. Şimdi Giriş yapabilirsiniz.');
        navigation.navigate('Home');
      } else {
        Alert.alert('Hata', response.hata || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/arkaplanlar/anasayfa.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.headerContainer}>
              <LinearGradient
                colors={['#00704A', '#43A047']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.headerGradient}
              >
                <Text style={styles.title}>Yeni Hesap Oluştur</Text>
              </LinearGradient>
            </View>

            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınız"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Soyadınız"
                  placeholderTextColor="#999"
                  value={formData.surname}
                  onChangeText={(text) => setFormData({...formData, surname: text})}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                />
              </View>
            </View>

            <View style={styles.kvkkMetinKapsayici}>
              <Text style={styles.kvkkMetin}>
                Kayıt Ol seçeneğine tıklayarak,{' '}
                <Text
                  style={styles.kvkkLink}
                  onPress={() => Linking.openURL('https://www.asebay.com.tr/rio-kvkk.html')}
                >
                  Üyelik Koşullarını (KVKK)
                </Text>{' '}
                kabul etmiş oluyorsunuz.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00704A', '#43A047']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Kaydol</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    margin: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputsContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '600',
    paddingLeft: 4,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  registerButton: {
    height: 55,
    marginHorizontal: 25,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    marginVertical: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00704A',
    fontSize: 15,
    fontWeight: '600',
  },
  kvkkMetinKapsayici: {
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 25,
  },
  kvkkMetin: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  kvkkLink: {
    color: '#00704A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});