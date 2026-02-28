import { Button } from '@feiwen/components/ui/button';
import { getTags } from '@feiwen/service/store';
import { Link } from 'react-router-dom';

export default function Query() {
  return (
    <div className="size-full">
      Home
      <Button render={<Link to="/fetch" />}>获取数据</Button>
      <Button
        onClick={async () => {
          await getTags();
        }}
      >
        test
      </Button>
    </div>
  );
}
