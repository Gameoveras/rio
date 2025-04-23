import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Alert, StatusBar } from 'react-native';
import { useEffect } from 'react';

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppService from '../../api/api';


export default function Hesabim() {
  const navigation = useNavigation();

  const [userData, setUserData] = React.useState({
    ad_soyad: '',
    eposta: '',
    telefon_no: '',
  });




  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Kullanıcı verisi alınamadı:', error);
      }
    };
    fetchUserData();

    
  
  }, []);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Hesabı Sil",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        {
          text: "Vazgeç",
          style: "cancel"
        },
        { 
          text: "Hesabı Sil", 
          onPress: async () => {
            try {
              const storedUserData = await AsyncStorage.getItem('userData');
              if (!storedUserData) {
                Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı.");
                return;
              }
  
              const { userId } = JSON.parse(storedUserData); // Kullanıcı ID'sini al
              const response = await AppService.deleteAccount(userId);
  
              if (response.success) {
                await AsyncStorage.removeItem('userData'); // Veriyi temizle
                Alert.alert("Başarılı", response.message, [
                  { text: "Tamam", onPress: () => navigation.navigate("Home") }
                ]);
              } else {
                Alert.alert("Hata", response.hata);
              }
            } catch (error) {
              console.error("Hesap silme hatası:", error);
              Alert.alert("Hata", "Bir hata oluştu, lütfen tekrar deneyin.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  

  const menuItems = [
    { icon: 'clock-outline', title: 'Hesap Hareketlerim', screen: 'HesapHareketleri',  },
    { icon: 'heart-outline', title: 'Favori İçeceklerim', screen: 'Tercihlerim',  },
    { icon: 'tag-outline', title: 'Kuponlarım', screen: 'Kuponlarim',  },
    { icon: 'bullhorn-outline', title: 'Kampanyalar', screen: 'Kampanyalar'},
    { icon: 'alert-circle-outline', title: 'Alerjen Listesi', screen: 'AlerjenListesi' },
    { icon: 'help-circle-outline', title: 'Yardım ve Destek', screen: 'YardimDestek' },
  ];

  const handleLogout = () => {
    try {
      AsyncStorage.removeItem('userData');
      navigation.navigate('Home');
    }
    catch (error) {
      console.error('Oturum kapatılırken bir hata oluştu:', error);
    }

  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        style={styles.headerContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profilim</Text>
          <View style={{ width: 30 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#e0e7ff" />
          </View>
          <Text style={styles.userName}>{userData.ad_soyad}</Text>
          <Text style={styles.userEmail}>{userData.eposta}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="phone" size={18} color="black" />
              <Text style={styles.infoText}>+90 {userData.telefon_no}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('ProfilDuzenle')}
          >
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
  {menuItems.map((item, index) => (
    <TouchableOpacity 
      key={index}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.menuIcon}>
        <MaterialCommunityIcons name={item.icon} size={24} color="white" />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <View style={styles.itemRight}>
        {item.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
      </View>
    </TouchableOpacity>
  ))}
</View>


        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color="black" />
            <Text style={styles.actionButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="white" />
            <Text style={[styles.actionButtonText, { color: 'white' }]}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Arka plan rengi
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#6F4E37', // Ana renk
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#3E2723', // Koyu metin rengi
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6F4E37', // Ana renk
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#C4A484', // İkincil renk
  },
  infoText: {
    color: '#3E2723', // Koyu metin rengi
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 14,
    backgroundColor: '#6F4E37', // Ana renk
  },
  editProfileText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    marginRight: 10,
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 25,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#C4A484', // İkincil renk
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#3E2723', // Koyu metin rengi
    fontFamily: 'Inter-Medium',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: '#D2691E', // Aksent renk
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  logoutButton: {
    borderColor: '#C4A484', // İkincil renk
    backgroundColor: '#F5F5DC', // Arka plan rengi
  },
  deleteButton: {
    borderColor: '#D2691E', // Aksent renk
    backgroundColor: '#D2691E', // Aksent renk
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
    color: '#6F4E37', // Ana renk
  },
});