# Ocean
GPU management System on Kubernetes For AI, Deep-Learning, Machine-Learning Researcher.

![image](https://github.com/AI-Ocean/Ocean/blob/master/wiki/ocean_job_main.png)

### Ocean 소개
Ocean은 2020년 경희대학교에서 효율적인 딥러닝 연구 개발을 위해 만들어진
Kubernetes 기반 **GPU 클러스터 관리 솔루션**입니다. 
 
### 성과
개발을 시작한 이후 지금까지 **MLVC 연구실에서는 Ocean을 통해 다양한 연구, 프로젝트가 진행**되었으며, 연구, 프로젝트에 더욱 **집중할 수 있는 편리하고 효율적인 시스템**을 토대로 좋은 퀄리티의 논문이 많이 나오고 있습니다. 2020년에 IEEE 저널에 3편 Accept 되는 실적에서 **2021년 7월 Top Conference인 ICLR 1편 ICCV 2편이 Accept 되었고, IEEE 저널에 9편을 게재 혹은 제출하여 6개월 만에 논문 13편이라는 놀라운 연구 성과와 속도**를 보여주고 있습니다.

더 읽어보기: https://bongjasee.tistory.com/pages/Ocean

## Feature
- 자동 GPU 스케줄링.
- 도커 이미지기반으로 1분만에 개발 환경 설정.
- 공유 볼륨으로 서버간 데이터, 소스코드 전송이 필요 없음.
- Data-syncer로 대용량 데이터셋을 미리 노드 복사하여 학습속도 향상.
- Job제출을 통한 GPU 작업관리로 효율적으로 GPU 클러스터를 운영.
- Job은 제출즉시 실행되어 빠른 실험, 연구가 가능.

## Install with Helm
```
$ helm dep update
$ helm install ocean -n ocean ./helm
```
> initial web admin id: `admin@example.com`, password: `Admin1!!`

## How to use
사용법은 위키 페이지를 참조해주세요.

https://github.com/AI-Ocean/Ocean/wiki/how-to-use

