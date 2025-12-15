import { Button } from '@feiwen/components/ui/button';
import { getTags } from '@feiwen/service/store';
import { Link } from 'react-router-dom';

export default function Query() {
  return (
    <div className="size-full">
      Home
      <Button asChild>
        <Link to="/fetch">获取数据</Link>
      </Button>
      <Button
        onClick={async () => {
          const data = await getTags();
          console.log(data);
        }}
      >
        test
      </Button>
    </div>
  );
}
