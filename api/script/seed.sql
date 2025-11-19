-- Usuários
INSERT INTO users (name, email, nick, password)
VALUES 
('João Silva', 'joao@example.com', 'joaos', '$2a$10$95IZKinqGPVbbZZuKB88ee/Yct1AE/vGqEM2NIjIbSjqKizNdnG06 '),
('Mariana Rocha', 'mariana@example.com', 'marirocha', '$2a$10$95IZKinqGPVbbZZuKB88ee/Yct1AE/vGqEM2NIjIbSjqKizNdnG06 '),
('Carlos Santos', 'carlos@example.com', 'carloss', '$2a$10$95IZKinqGPVbbZZuKB88ee/Yct1AE/vGqEM2NIjIbSjqKizNdnG06 '),
('Ana Lima', 'ana@example.com', 'anal', '$2a$10$95IZKinqGPVbbZZuKB88ee/Yct1AE/vGqEM2NIjIbSjqKizNdnG06 '),
('Pedro Alves', 'pedro@example.com', 'pedroa', '$2a$10$95IZKinqGPVbbZZuKB88ee/Yct1AE/vGqEM2NIjIbSjqKizNdnG06 ');

-- Seguidores
INSERT INTO followers (user_id, follows_id)
VALUES
(1, 2),   -- João segue Mariana
(1, 3),   -- João segue Carlos
(2, 1),   -- Mariana segue João
(3, 1),   -- Carlos segue João
(4, 5),   -- Ana segue Pedro
(5, 1);   -- Pedro segue João
