import React, { useState } from 'react';
import { Text as RNText, View, StyleSheet, TouchableOpacity, Image, FlatList, Linking } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import texts from '../translation/texts';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import Icon from "react-native-vector-icons/MaterialIcons";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};


type VideoItem = {
  id: string;
  title: string;
  thumbnail: any;
  duration: string;
  uploadDate: string;
  youtubeLink: string;
};

const ExerciseVideos: React.FC = () => {
  const [isTamilVisible, setIsTamilVisible] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Exercise">>();

  const englishVideos: VideoItem[] = [
    {
      id: '1',
      title: texts.english.exerciseVideoOne,
      thumbnail: require('../../assets/images/video1.jpg'),
      duration: 'Duration: 05:52',
      uploadDate: 'Uploaded On: 10-09-2024',
      youtubeLink: 'https://youtu.be/teVckz1ZfwE',
    },
    {
      id: '4',
      title: 'Yoga Video',
      thumbnail: require('../../assets/images/yogaThumbnail.png'),
      duration: 'Duration: 05:36',
      uploadDate: 'Uploaded On: 28-10-2024',
      youtubeLink: 'https://youtu.be/EQjosrEg6kI',
    },
    {
      id: '5',
      title: 'Conversation With Doctor',
      thumbnail: require('../../assets/images/doctorVid.png'),
      duration: 'Duration: 05:36',
      uploadDate: 'Uploaded On: 28-10-2024',
      youtubeLink: 'https://youtu.be/1EoadmO5zFk',
    },
    {
      id: '6',
      title: 'Let us know about PCI',
      thumbnail: require('../../assets/images/operation.png'),
      duration: 'Duration: 00:52',
      uploadDate: 'Uploaded On: 25-12-2024',
      youtubeLink: 'https://youtu.be/pUAAB9yUUPY',
    },
    
  ];

  const tamilVideos: VideoItem[] = [
    {
      id: '2',
      title: 'உடற்பயிற்சி',
      thumbnail: require('../../assets/images/video2.jpg'),
      duration: 'நேரம்: 05:36',
      uploadDate: 'பதிவிடப்பட்டது On: 28-10-2024',
      youtubeLink: 'https://youtu.be/2V6c8ToZfqs',
    },
    {
      id: '3',
      //title: texts.tamil.exerciseVideoThree,
      title: 'யோகா',
      thumbnail: require('../../assets/images/yogaThumbnail.png'),
      duration: 'நேரம்: 05:36',
      uploadDate: 'பதிவிடப்பட்டது: 28-10-2024',
      youtubeLink: 'https://youtu.be/TT_WCGdLmC0',
    },
    {
      id: '6',
      //title: texts.tamil.exerciseVideoThree,
      title: 'தமிழில் மருத்துவரின் உரையாடல்',
      thumbnail: require('../../assets/images/doctorVid.png'),
      duration: 'நேரம்: 03:39',
      uploadDate: 'பதிவிடப்பட்டது: 28-10-2024',
      youtubeLink: 'https://youtu.be/CnGAx6-H3IA',
    },
    
  ];

  const handleVideoSelect = (video: VideoItem) => {
    Linking.openURL(video.youtubeLink).catch(err => console.error('Failed to open video', err));
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity style={styles.videoCard} onPress={() => handleVideoSelect(item)}>
      <View style={styles.thumbnailContainer}>
        <Image source={item.thumbnail} style={styles.thumbnail} />
        <View style={styles.playIconContainer}>
          <FontAwesomeIcon name="play-circle" size={40} color="#FFF" />
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoDetail}>{item.duration}</Text>
        <Text style={styles.videoDetail}>{item.uploadDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#020202" />
      </TouchableOpacity>
      
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>Exercise Videos</Text>
        <TouchableOpacity onPress={() => setIsTamilVisible(!isTamilVisible)} style={styles.switchButton}>
          <MaterialIcon name="swap-horiz" size={20} color="#4169E1" />
          <Text style={styles.switchText}>{isTamilVisible ? "Show English" : "தமிழில் பார்க்க"}</Text>
        </TouchableOpacity>
      </View>

      {isTamilVisible ? (
        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>தமிழ்</Text>
          <FlatList
            data={tamilVideos}
            renderItem={renderVideoItem}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>English</Text>
          <FlatList
            data={englishVideos}
            renderItem={renderVideoItem}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
    marginTop: 60,
    marginBottom: 45,
  },
  backButton: {
    position: 'absolute',
    top: 13,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    left: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginRight: 5,
    right: 15,
  },
  switchText: {
    color: '#4169E1',
  },
  videoSection: {
    marginBottom: 20,
    padding: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoCard: {
    marginBottom: 15,
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  videoInfo: {
    marginTop: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoDetail: {
    fontSize: 12,
    color: '#888',
  },
});

export default ExerciseVideos;
