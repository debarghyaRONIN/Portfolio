import { useActiveSection } from '@/utils/hooks/useActiveSection';

interface TableOfContentsItem {
  title: string;
  href: string;
}

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

const TableOfContents = ({ items }: TableOfContentsProps) => {
  const sectionIds = items.map(item => item.href.replace('#', ''));
  const activeSection = useActiveSection(sectionIds);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    scrollToSection(id);
  };

  return (
    <div className="sticky top-24">
      <nav className="space-y-1 px-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Table of Contents
        </h2>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
              activeSection === item.href.replace('#', '')
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;