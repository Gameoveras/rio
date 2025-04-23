import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppService from '../api/api';
import { use } from 'react';

export default function Unuttum() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [kode, setKode] = useState(''); // Store the code returned by the API

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [fadeAnim]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email) => {
    if (!email) return 'E-posta adresi gerekli.';
    if (!emailRegex.test(email)) return 'Geçerli bir e-posta adresi girin.';
    return null;
  };


  // Send verification code to email
  const handleSendCode = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      Alert.alert('Hata', emailError);
      return;
    }

    setLoading(true);
    try {
      const response = await AppService.kodgonder2(email);

      // Even if the email is not registered, the server sends a success response
      if (response?.success) {
        setUserId(response.userId);
        setKode(response.dogrulamaKodu); // Save the code from the API
        setStep(2);
        Alert.alert('Bilgi', 'Eğer email kayıtlıysa kod gönderildi.');
      } else {
        Alert.alert('Hata', response?.hata || 'Geçersiz sunucu yanıtı');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Verify the code entered by the user against the code received from the server
  const handleVerifyCode = () => {
    if (!verificationCode) {
      Alert.alert('Hata', 'Lütfen doğrulama kodunu girin.');
      return;
    }
    if (verificationCode === kode) {
      setStep(3);
    } else {
      Alert.alert('Hata', 'Doğrulama kodu yanlış');
    }
  };

  // Reset the password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      const response = await AppService.sifresifirla(
        userId, // Here we use the email directly
        newPassword
      );

      if (response?.success) {
        Alert.alert('Başarılı', 'Şifre güncellendi', [
          { text: 'Tamam', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Hata', response?.hata || 'Şifre sıfırlama başarısız');
      }
    } catch (error) {
      console.error('Reset Error:', error);
      Alert.alert('Hata', 'Sunucu iletişim hatası');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.subtitle}>E-posta adresinizi girin</Text>
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Doğrulama Kodu Gönder</Text>
              )}
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.subtitle}>E-postanıza gelen 6 haneli kodu girin</Text>
            <TextInput
              style={styles.input}
              placeholder="Doğrulama Kodu"
              placeholderTextColor="#666"
              maxLength={6}
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>İleri</Text>
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.subtitle}>Yeni şifrenizi belirleyin</Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni Şifre"
              placeholderTextColor="#666"
              secureTextEntry
              keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Şifreyi Tekrar Girin"
              placeholderTextColor="#666"
              secureTextEntry
              keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />


            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Tamamla</Text>
              )}
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/arkaplanlar/unuttum.png')}
      style={styles.backgroundImage}
    >
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
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.title}>Şifre Sıfırlama</Text>
            {renderStep()}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonContainer}>
                <Text style={styles.backButtonText}>Geri Dön</Text>
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: '#00704A',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  backButtonContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00704A',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    backgroundColor: '#999999',
  }
});
