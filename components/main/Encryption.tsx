declare module '../sub/SkillDataProvider' {
  interface Props {
    src: string;
    width: number;
    height: number;
    index: number;
  }
  
  const SkillDataProvider: React.FC<Props>;
  export default SkillDataProvider;
}

declare module '../sub/SkillText' {
  const SkillText: React.FC;
  export default SkillText;
} 