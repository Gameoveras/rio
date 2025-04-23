import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Geri dön butonu için ikon kütüphanesi

export default function AlerjenListesi({ navigation }) {
  const alerjenVerisi = {
    sogukKahveler: {
      baslik: "Soğuk Kahve Alerjenleri",
      urunler: [
        { isim: "Soğuk Americano", alerjenler: ["Kahve"] },
        { isim: "Soğuk Cafe Latte", alerjenler: ["Süt", "Kahve"] },
        { isim: "Soğuk Chai Tea Latte", alerjenler: ["Süt", "Çay", "Baharatlar"] },
        { isim: "Soğuk Mocha", alerjenler: ["Süt", "Kahve", "Soya", "Sülfitler"] },
        { isim: "Bisküvili Soğuk Latte", alerjenler: ["Süt", "Kahve", "Buğday", "Gluten"] }
      ]
    },
    sicakIcecekler: {
      baslik: "Sıcak İçecek Alerjenleri",
      urunler: [
        { isim: "Sıcak Çikolata", alerjenler: ["Süt", "Soya"] },
        { isim: "Sahlep", alerjenler: ["Süt", "Kuruyemiş"] },
        { isim: "Chai Tea Latte", alerjenler: ["Süt", "Çay", "Baharatlar"] }
      ]
    },
    dondurulmus: {
      baslik: "Frozen İçecek Alerjenleri",
      urunler: [
        { isim: "Orman Meyveleri", alerjenler: ["Sülfitler"] },
        { isim: "Yeşil Elma Frozen", alerjenler: ["Sülfitler"] }
      ]
    },
    milkshake: {
      baslik: "Milkshake Alerjenleri",
      urunler: [
        { isim: "Tüm Milkshake Çeşitleri", alerjenler: ["Süt", "Soya"] }
      ]
    }
  };

  const alerjenEtiketleriOlustur = (alerjenler) => {
    return (
      <View style={styles.alerjenEtiketContainer}>
        {alerjenler.map((alerjen, index) => (
          <View key={index} style={styles.alerjenEtiket}>
            <Text style={styles.alerjenMetin}>{alerjen}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.geriDonButon}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerBaslik}>Alerjen Bilgilendirmesi</Text>
      </View>
      <ScrollView>
        <View style={styles.baslik}>
          <Text style={styles.altBaslikMetin}>
            Lütfen sipariş vermeden önce alerjileriniz hakkında personelimizi bilgilendiriniz
          </Text>
        </View>

        {Object.values(alerjenVerisi).map((kategori, index) => (
          <Card key={index} style={styles.kart}>
            <Card.Title title={kategori.baslik} titleStyle={styles.kategoriBaslik} />
            <Card.Content>
              {kategori.urunler.map((urun, urunIndex) => (
                <View key={urunIndex} style={styles.urunContainer}>
                  <Text style={styles.urunIsim}>{urun.isim}</Text>
                  {alerjenEtiketleriOlustur(urun.alerjenler)}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

        <View style={styles.uyari}>
          <Text style={styles.uyariMetin}>
            ⚠️ Ürünlerimiz fındık, süt, soya, buğday ve diğer alerjenlerin izlerini içerebilir. 
            Hazırlama sürecinde çapraz bulaşma riski bulunmaktadır.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  geriDonButon: {
    marginRight: 10,
  },
  headerBaslik: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  baslik: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  baslikMetin: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  altBaslikMetin: {
    fontSize: 16,
    color: '#cccccc',
  },
  kart: {
    margin: 10,
    elevation: 4,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  kategoriBaslik: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  urunContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  urunIsim: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  alerjenEtiketContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alerjenEtiket: {
    backgroundColor: '#ffebee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  alerjenMetin: {
    fontSize: 12,
    color: '#c62828',
  },
  uyari: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  uyariMetin: {
    fontSize: 14,
    color: '#e65100',
    textAlign: 'center',
  },
});