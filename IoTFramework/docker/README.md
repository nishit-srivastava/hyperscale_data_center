cp /mnt/d/hyperscale/hyperscale_data_center/IoTFramework/docker/docker-compose.tb.yml .


sudo rm -rf rabbitmq-data/*
sudo chown -R 999:999 rabbitmq-data


sudo chown -R 799:799 tb-data
sudo chmod -R 775 tb-data


sudo chown -R 999:999 postgres-data
sudo chown -R 999:999 timescale-data
sudo chmod -R 775 postgres-data timescale-data

Network tb_default        Created                                                                                                                                                                        0.1s
 ✔ Container tb-timescaledb  Healthy                                                                                                                                                                       10.6s
 ✔ Container tb-rabbitmq     Healthy                                                                                                                                                                       11.6s
 ✔ Container tb-postgres     Healthy                                                                                                                                                                       11.1s
 ✔ Container tb_ts           Started 


 thingsboard@4abbbb4bd5docker exec -it tb_ts getent hosts rabbitmq tb_ts getent hosts rabbitmq
172.27.0.3      rabbitmq
nishit@nishit-s:~/tb$ docker exec -it tb_ts nc -zv rabbitmq 5672
OCI runtime exec failed: exec failed: unable to start container process: exec: "nc": executable file not found in $PATH: unknown