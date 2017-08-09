1. Install xcode from AppStore

2. Install Xcode command line tools
xcode-select --install

3. Install ansible
brew install ansible

4. Install pre-requisites
pip install requests
pip install importlib
pip install PyYAML
pip install python-ldap

5. Download and unzip ibmsecurity from GITHUB to temp directory e.g. /tmp
link to ibmsecurity https://github.com/IBM-Security/ibmsecurity

6. Install ibmsecurity python package
cd /tmp/ibmsecurity-master
python setup.py install

7. create Project folder in user's home directory
mkdir ~/Ansible

8. Install ansible roles
ansible-galaxy install git+https://github.com/ibm-security/isam-ansible-roles.git --roles-path ~/Ansible

9. Optional - Download ansible playbook . Only required to setup sample playbooks
ansible-galaxy install git+https://github.com/IBM-Security/isam-ansible-playbook-sample.git --roles-path ~/Ansible

10. Update /etc/hosts or <System32>/drivers/etc/hosts file with demo host entries
172.16.163.101  isam.myidp.ibm.com
172.16.163.102  www.myidp.ibm.com
172.16.163.103  isam.mmfa.ibm.com
172.16.163.104  www.mmfa.ibm.com
172.16.163.105  isam.buweb.ibm.com
172.16.163.106  www.buweb.ibm.com
172.16.163.201  isam.mysp.ibm.com
172.16.163.202  www.mysp.ibm.com
172.16.163.204  www.myrp.ibm.com
172.16.163.151  isim7.demo.ibm.com isim7
192.168.125.151  www.isim7.ibm.com
172.16.163.150  sds64.demo.ibm.com isds64


11. Update Ansible/ansible.cfg only if Ansible was installed not into user's home directory
[defaults]
# If Ansible folder is NOT under user's home directory specify full path to role_path folder
roles_path				= ~/Ansible/isam-ansible-roles
#roles_path				= /opt/IBM/Ansible/isam-ansible-roles
# If Ansible folder is NOT under user's home directory specify full path to retry_files_save_path folder
retry_files_save_path 	= ~/Ansible/Playbooks/retry
#retry_files_save_path 	= /opt/IBM/Ansible/Playbooks/retry

12. Configure ansible root path in <environment>/group_vars/all/vars.yml only if Ansible root folder not in the user's home directory
# Ansible root path
# If Ansible folder is NOT under user's home directory specify full path to Ansible folder
#ansible_root_path: "/opt/IBM/Ansible/"
ansible_root_path: "{{ lookup('env','HOME') }}/Ansible"

13. Update subnet with actual IP in <environment>/group_vars/all/vars.yml
# Demo subnet 
ipv4_1_1_ip_net: 172.16.163
ipv4_1_2_ip_net: 172.16.222

14. Run the playbook with the following commands:
For SAML demo:
ansible-playbook -i Playbooks/inventories/federationdemo Playbooks/samldemo.yml
For OIDC demo
ansible-playbook -i Playbooks/inventories/federationdemo Playbooks/oidcdemo.yml
For MMFA Demo
ansible-playbook -i Playbooks/inventories/mmfademo Playbooks/mmfademo.yml