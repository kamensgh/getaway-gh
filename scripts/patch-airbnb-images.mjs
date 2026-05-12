/**
 * Patches image + images fields for all Airbnb properties using scraped data.
 * Run: node scripts/patch-airbnb-images.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Scraped images keyed by Airbnb listing ID
const AIRBNB_IMAGES = {
  '1033366517212822912': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/3133be16-c0d4-4d11-bb55-11250c710730.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/56164dc1-dd6a-427f-adb7-c06711669ff0.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/d8e8e8c2-577c-43c9-8b5f-507e5380dc33.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/ada4e65c-bccc-41c5-b424-435c3ab569f9.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/a8f352c5-5dfd-429f-a417-d1c8d7a15aae.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/99eac0fa-93e9-450a-a969-d9141123cf20.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/20fb97c1-6252-4d5c-bc6f-0ba368eea9e4.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/3a89ad1e-14aa-45c2-9621-da84f537390b.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/6f8e4705-e167-4f41-8992-cf341723e328.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTAzMzM2NjUxNzIxMjgyMjkxMg==/original/90b954f2-cea6-4b1a-80eb-6a3baa84f7e2.jpeg',
  ],
  '1071549023411755958': [
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/0ad4a398-188d-47d4-9b04-7746071b9210.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/2733b4aa-05f6-4dee-a9b9-d56a83a89c9f.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/6af8abf1-2e38-474b-a58e-7239167d30b6.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/cc7349f7-4a4e-4c4a-beda-20b261496781.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/22f75b74-77cc-4418-882f-18835a186535.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/ca006cc3-a507-4bb5-938c-63bda3f5e729.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1071549023411755958/original/ba55ed51-ba29-4e29-9877-629e37ebb315.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/314227e9-048b-45b9-83a8-01cf8a6e78b4.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1071549023411755958/original/e476c544-3adb-43f4-a130-fe77af266209.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1071549023411755958/original/65b18e3c-ff04-437b-8a00-ec33c07c881c.jpeg',
  ],
  '570879428120020488': [
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/e96fbd55-bd86-44b2-a1cf-79e72245f243.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/dd88da50-0753-4d77-8fbe-3479e09aa181.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/05e4e300-ba83-4632-99eb-d7fd37d69803.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/b92d79a6-d1d0-4ba7-9ca8-34c14beda22e.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/3c1971a3-9140-43e3-a02d-73241ccfdf7f.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/8e779cbf-2062-4f46-9af4-f1239d7bf470.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/72b51279-d91d-4d2f-929f-5349d14fdaaa.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/a16d2c59-77d8-44be-96ca-f724cfef2c8c.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/40ae3fd2-487d-4daf-9f31-89cf2cdd759d.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-570879428120020488/original/d25e462c-6f0a-4d4f-b62b-8c6edd039813.jpeg',
  ],
  '42269734': [
    'https://a0.muscache.com/im/pictures/3a8e19bc-6e8b-4d33-a225-3ebccde75571.jpg',
    'https://a0.muscache.com/im/pictures/4dea4bd3-aba0-46f7-a630-959828b4c173.jpg',
    'https://a0.muscache.com/im/pictures/d2803b18-589b-42e4-b8e0-49f433749ca6.jpg',
    'https://a0.muscache.com/im/pictures/7ddbaa27-dd0c-4b58-ac28-fde3f7eeb1ba.jpg',
    'https://a0.muscache.com/im/pictures/8d9b2e82-bea0-4891-9def-e74c12708c39.jpg',
    'https://a0.muscache.com/im/pictures/e37da80d-7004-4e54-88fa-0a5ce20c0876.jpg',
    'https://a0.muscache.com/im/pictures/8fcdc5dd-c8a4-4624-b161-6d6755278502.jpg',
    'https://a0.muscache.com/im/pictures/1c473ea0-73aa-4239-8104-16c34c0ccefa.jpg',
    'https://a0.muscache.com/im/pictures/1db43711-9737-489d-81ae-aa46ebe93d0a.jpg',
    'https://a0.muscache.com/im/pictures/24896803-1280-488a-8932-323105929617.jpg',
  ],
  '1225697238694437763': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/3dbcf4ee-1bd3-4e45-879a-28150748482b.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1225697238694437763/original/937fe075-8b65-445b-b20c-a18efb54d6f5.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/9c1246c5-273b-49f2-a3ef-42a7b8f7b34f.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/895574c7-f2a4-48a2-985a-b8d97e5cf8ab.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/8842b375-1fda-4f77-98d1-c21844f5c1ce.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/c7b49734-0ed5-46f3-b9a0-00b77203b2f3.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/e7aeaf44-2dd1-4f13-8348-7c0fd271c4e3.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/2e545afa-5869-4b92-8c8b-2288cf792c47.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/ae19d147-a0b9-4c86-81b5-b6bc33ddd777.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1031193111201672701/original/8df95434-4ea2-4a0f-ac7e-9fb85d047086.jpeg',
  ],
  '1228336006083462110': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyODMzNjAwNjA4MzQ2MjExMA%3D%3D/original/db42b123-e2e4-41ed-8559-566f44d6ee67.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyODMzNjAwNjA4MzQ2MjExMA%3D%3D/original/c6e7141b-0b01-46f1-9382-cb764ec9e8c2.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyODMzNjAwNjA4MzQ2MjExMA%3D%3D/original/c883b11e-670d-48b2-8249-63620eedecb3.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyODMzNjAwNjA4MzQ2MjExMA%3D%3D/original/fb8ce571-c964-4fef-81fb-ef6f6d45a849.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyODMzNjAwNjA4MzQ2MjExMA%3D%3D/original/9f75e66e-67ad-4e2c-a606-0306da6da0e8.jpeg',
  ],
  '1223105072572204917': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/4684aa12-f6ec-4951-88ff-d99e5471e7a8.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/12e44880-8547-4362-aebe-dda2ab5de26a.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/ae070759-9f67-4d71-bf32-25420ae1501d.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/051fa0b3-efb9-47f8-9e4e-3b156c756c78.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/c59fd574-28bb-40f8-8bc9-96119625b752.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/dd390b77-eb40-49ea-b5fd-1b328064fa94.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/b1d24827-7ff2-4263-b9f8-46e3467673df.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/5b4f25de-3b65-4481-8996-50baf224e428.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/347aef95-3314-4b65-bc32-356c8a1d86c5.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIyMzEwNTA3MjU3MjIwNDkxNw==/original/6022b915-3c4b-4c2e-937b-fb48f227f4a2.jpeg',
  ],
  '52091756': [
    'https://a0.muscache.com/im/pictures/miso/Hosting-52091756/original/688eae0a-1f0a-4ae1-9e2f-148d5f25b2a7.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-52091756/original/5f60b045-0452-4e70-b658-7301e1f416c3.jpeg',
    'https://a0.muscache.com/im/pictures/bf9ca4bd-32c7-4eb3-867d-d704e50da930.jpg',
    'https://a0.muscache.com/im/pictures/c7bbae63-95b2-4f58-a96b-262d186ac4f5.jpg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-52091756/original/c41f9612-e42f-4f7e-b7ef-fddafcd8e5fe.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NTIwOTE3NTY%3D/original/ca240908-d607-4e10-b6e0-5972ab9ca00a.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NTIwOTE3NTY%3D/original/6fbce0f9-ab80-432a-b2c2-0d38e295af83.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NTIwOTE3NTY%3D/original/2380c1c8-fc8d-4ef8-92ab-eb795f30b192.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NTIwOTE3NTY%3D/original/27d4d41c-edfe-4325-8a9c-a387952fdbeb.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NTIwOTE3NTY%3D/original/bdf803ef-b837-45dd-9b88-fba2cea6920f.jpeg',
  ],
  '574492943797045839': [
    'https://a0.muscache.com/im/pictures/633f0cc5-dee3-4184-9152-1e88acd4a5e1.jpg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/0b499df6-79db-42a6-9c3f-a4274f7006cf.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/81d14634-3ea6-438e-be58-3e88de95df3e.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/7bd8fb7a-cf45-493e-b57b-fb41ebb9dce1.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/f745b326-20e9-467a-b250-e929e9a997a3.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/e3e2c741-215d-4008-af66-f57a978cf3bb.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/fecdb804-b0ea-40c4-98bf-0b397c6e8ae0.jpeg',
    'https://a0.muscache.com/im/pictures/89e03f25-89a5-47a0-8686-b12b9e1da274.jpg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-574492943797045839/original/ce1bab01-6f4c-437f-97dc-f56c38866ea1.jpeg',
    'https://a0.muscache.com/im/pictures/8db31e3b-eae2-4477-b465-311faeebda03.jpg',
  ],
  '1415650490501956222': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQxNTA4OTQ0OTQzMTQ0ODMzMA==/original/7b145fd2-3962-49ed-acfb-01cd9a96270e.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1415650490501956222/original/696c73ec-a0f1-44a0-9b7b-f8987531e558.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1415650490501956222/original/28e79e72-731c-4cc1-8d37-28497d2fd503.png',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1415650490501956222/original/1817b6eb-953c-4d64-8e7a-1fc12019a9a3.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1415650490501956222/original/2745a03b-992d-4837-bacc-7682fa529fc6.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1415650490501956222/original/db6573e8-55a7-4396-879b-f43208afab5e.png',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQxNTA4OTQ0OTQzMTQ0ODMzMA==/original/b5b04b72-b0c9-4afd-b33c-a6aba7d098db.png',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQxNTA4OTQ0OTQzMTQ0ODMzMA==/original/a218374a-c518-40fe-aad6-9c055089bb64.png',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQxNTA4OTQ0OTQzMTQ0ODMzMA==/original/1be6dcb8-56a4-416a-be55-6f327caa4d12.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQxNTA4OTQ0OTQzMTQ0ODMzMA==/original/35069b97-f2be-4611-8e4c-a6668111b995.jpeg',
  ],
  '1166259496830621028': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1166259496830621028/original/dd02b9f2-dbd6-4b03-bfe6-8c3622786650.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1166259496830621028/original/6bada456-c8ef-4073-8f8e-9bcf24f25bdc.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/fed09893-6e69-43b6-b1d2-ffa3b5ae7cb7.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/17ea451f-8b6d-4f0d-bf06-639284a4a1a9.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/06de8552-cdde-44c1-8428-dd31d6c9b4de.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/a723a71d-be75-4cd5-9064-2d45cf17f4db.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/f89862f7-fe0e-4faa-bc80-75ee415d7a74.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/8f3346bc-29be-4875-87ee-811c165659a7.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2NjI1OTQ5NjgzMDYyMTAyOA==/original/a0bdf089-043c-423a-97a6-9ffa20d7570f.jpeg',
  ],
  '17762601': [
    'https://a0.muscache.com/im/pictures/024b8854-8fdb-436b-91c6-b91ee52358ee.jpg',
    'https://a0.muscache.com/im/pictures/07ad31b8-22be-454d-b640-d680d632a731.jpg',
    'https://a0.muscache.com/im/pictures/92306177-13be-40dd-b311-ce42583483ed.jpg',
    'https://a0.muscache.com/im/pictures/893c4f34-6f7d-44d1-ae16-e4dd662f8375.jpg',
    'https://a0.muscache.com/im/pictures/5edc840a-9249-47cb-9d95-af636c40b751.jpg',
    'https://a0.muscache.com/im/pictures/79fc314e-4847-4c5e-889f-0ac696dda138.jpg',
    'https://a0.muscache.com/im/pictures/bbf55e7f-2a4f-47db-8a47-c94583235819.jpg',
    'https://a0.muscache.com/im/pictures/91aca7ab-5631-4dbe-81f1-c3eb094c1c25.jpg',
    'https://a0.muscache.com/im/pictures/771be42b-cac5-4370-a4bc-744f865695e5.jpg',
    'https://a0.muscache.com/im/pictures/7884d461-60e8-4438-bec1-2d22b21dfd3b.jpg',
  ],
  '1431911595624467606': [
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/07c42f14-23f4-460f-9156-c3250cf28fdc.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/57da2464-9dd6-4a4b-b3f5-6733c7c4d492.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/f22791ba-1767-4bbc-9f10-5046782785cf.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/77afd995-0b80-4694-aa9c-f30a69ba1e34.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/21715208-c4df-43be-8405-47d88a9aec71.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1431911595624467606/original/b529c2c2-d93b-47a9-a7ee-05b41df4e060.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1431911595624467606/original/0b2beccc-78f6-4d7f-b021-26b2a423952c.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/14b66568-216d-4159-a61c-631aa2e5bc4a.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/03c6820c-8d36-43ea-849e-0793e3360613.jpeg',
    'https://a0.muscache.com/im/pictures/miso/Hosting-1431911595624467606/original/826b393a-9be7-4db1-8454-4aa70ee2dd66.jpeg',
  ],
  '1131867580470822789': [
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/638ef4a2-2615-4d69-9243-78c7888df2c9.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/1b232134-acc2-4ecc-a96b-dce97b213667.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/65c77ab5-1b2a-4eec-8512-d2e1ff6bce4c.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/039ceb29-a7c8-45b3-ad59-590981cebb69.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/a3c5c07e-557e-4bea-81d0-a282d62ee871.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/c6a1c5b6-4f49-4be5-97e6-bc9991b090ec.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/0b8aeaf9-3b59-4be9-9def-2fc4c24a0c50.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/987ad3f0-26c4-458e-9f26-478d4224f371.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/b6f5514f-d4c6-422c-a85c-642aa18a250e.jpeg',
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1131867580470822789/original/edce81a0-122b-4395-8c10-cc95867c84d4.jpeg',
  ],
  '8356649': [
    'https://a0.muscache.com/im/pictures/b7f4854e-e9d1-4aae-88d9-b6b0035ba21a.jpg',
    'https://a0.muscache.com/im/pictures/5358c3ec-1b0d-40ff-ab49-1419ba534043.jpg',
    'https://a0.muscache.com/im/pictures/e756c7ec-af53-4dbf-a201-9dbe86adebe1.jpg',
    'https://a0.muscache.com/im/pictures/9ce9c7e1-a22e-4266-9a89-b637020a5a92.jpg',
    'https://a0.muscache.com/im/pictures/be343e35-bc58-45fe-95b8-3919c6038246.jpg',
    'https://a0.muscache.com/im/pictures/3b83aa49-c379-41ed-a2ae-f47c3fc9adca.jpg',
    'https://a0.muscache.com/im/pictures/27f11339-a46b-4cba-b34a-3f6faa3b5126.jpg',
    'https://a0.muscache.com/im/pictures/6812da43-ac2f-453e-9a13-06cd5af60a94.jpg',
    'https://a0.muscache.com/im/pictures/7037109b-0be5-42ca-9ba8-fc9f89328e87.jpg',
  ],
}

let src = readFileSync(join(ROOT, 'src/data/properties.js'), 'utf8')
let patched = 0

for (const [airbnbId, imgs] of Object.entries(AIRBNB_IMAGES)) {
  const urlPattern = `https://www.airbnb.com/rooms/${airbnbId}`
  if (!src.includes(urlPattern)) { console.log(`  SKIP ${airbnbId} — not in file`); continue }

  // Find the block for this airbnbUrl and replace image + images above it
  // Strategy: find airbnbUrl line, then search backwards for 'image:' and 'images:' lines
  const lines = src.split('\n')
  const airbnbLine = lines.findIndex(l => l.includes(urlPattern))
  if (airbnbLine === -1) continue

  // Scan backwards up to 20 lines to find image: and images:
  let imgLine = -1, imgsLine = -1, imgsEnd = -1
  for (let i = airbnbLine - 1; i >= Math.max(0, airbnbLine - 25); i--) {
    if (imgsEnd === -1 && lines[i].trim().endsWith('],')) imgsEnd = i
    if (lines[i].match(/^\s+images:\s*\[/)) { imgsLine = i; break }
  }
  for (let i = airbnbLine - 1; i >= Math.max(0, airbnbLine - 25); i--) {
    if (lines[i].match(/^\s+image:\s*'/)) { imgLine = i; break }
  }

  if (imgLine === -1) { console.log(`  SKIP ${airbnbId} — no image: line found`); continue }

  const indent = lines[imgLine].match(/^(\s+)/)?.[1] || '    '
  const newImgLine = `${indent}image: '${imgs[0]}',`
  const newImgsBlock = [
    `${indent}images: [`,
    ...imgs.map((u, i) => `${indent}  '${u}'${i < imgs.length - 1 ? ',' : ''}`),
    `${indent}],`,
  ].join('\n')

  // Replace image: line
  lines[imgLine] = newImgLine

  // Replace images: [...], block (may span multiple lines)
  if (imgsLine !== -1 && imgsEnd !== -1) {
    lines.splice(imgsLine, imgsEnd - imgsLine + 1, newImgsBlock)
  } else if (imgsLine !== -1) {
    lines[imgsLine] = newImgsBlock
  }

  src = lines.join('\n')
  patched++
  console.log(`  ✓ Patched ${airbnbId} (${imgs.length} images)`)
}

writeFileSync(join(ROOT, 'src/data/properties.js'), src)
console.log(`\nDone — ${patched} properties updated.`)
