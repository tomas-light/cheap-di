import cheapDi from 'cheap-di';
import { Service1 } from './Service1';
import { Service2 } from './Service2';
import { Service3 } from './Service3';

const service1 = cheapDi.container.resolve(Service1);
if (!service1) {
  console.log('no service 1');
} else {
  service1.data();
}

const service2 = cheapDi.container.resolve(Service2);
if (!service2) {
  console.log('no service 2');
} else {
  service2.data();
}

const service3 = cheapDi.container.resolve(Service3);
if (!service3) {
  console.log('no service 3');
} else {
  service3.data();
}
