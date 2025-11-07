import MyPage from '@/views/mypage/MyPage.vue';
import TravelDetailView from '@/views/mypage/TravelDetailView.vue'

export default [
  {
    path: '/mypage',
    name: 'mypage',
    component: MyPage,
  },
  {
    path: '/mypage/travel/:id',      
    name: 'travelDetail',
    component: TravelDetailView,
    props: true,                   
  },
];