import { render } from 'preact';
import '../../src/ui/styles.css';
import { Dashboard } from '../../src/ui/Dashboard';

render(<Dashboard />, document.getElementById('app')!);
